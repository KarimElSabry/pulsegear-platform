import { describe, it, expect, vi, afterEach } from 'vitest'
import { photoGroups, sameColorIds } from '../variant-images'
import { checkPhotoFile, uploadProductPhoto, MAX_PHOTO_BYTES } from '../product-photo-upload'

const V = (id: number, name: string, size_name: string | null = null) => ({ id, name, size_name })

describe('photoGroups (what you can pick under a photo)', () => {
  it('writes the sizes next to the color', () => {
    const g = photoGroups([V(1, 'Black', 'M'), V(2, 'Black', 'L'), V(3, 'Beige', '42mm')])
    expect(g).toEqual([{ id: 1, label: 'Black (M, L)', ids: [1, 2] }, { id: 3, label: 'Beige (42mm)', ids: [3] }])
  })
  it('a color without size keeps its plain name', () => {
    expect(photoGroups([V(1, 'White')])).toEqual([{ id: 1, label: 'White', ids: [1] }])
  })
  it('size-only options are listed one by one (they used to be missing)', () => {
    expect(photoGroups([V(1, '', '42mm'), V(2, '', '46mm')])).toEqual([
      { id: 1, label: '42mm', ids: [1] }, { id: 2, label: '46mm', ids: [2] },
    ])
  })
  it('matches colors regardless of case and spaces', () => {
    expect(photoGroups([V(1, 'Black', 'M'), V(2, ' black ', 'L')])).toHaveLength(1)
  })
})

describe('sameColorIds', () => {
  const list = [V(1, 'Black', 'M'), V(2, 'Black', 'L'), V(3, '', '42mm'), V(4, '', '46mm')]
  it('sizes of one color share their photos', () => expect(sameColorIds(list, list[0])).toEqual([1, 2]))
  it('size-only options do NOT share photos with each other', () => {
    expect(sameColorIds(list, list[2])).toEqual([3])
    expect(sameColorIds(list, list[3])).toEqual([4])
  })
  it('nothing selected', () => expect(sameColorIds(list, null)).toBeNull())
})

describe('photo upload from the computer', () => {
  afterEach(() => vi.unstubAllGlobals())
  const file = (name: string, size = 1000) => ({ name, size, type: 'image/jpeg' }) as unknown as File
  it('accepts normal photos and refuses other types and huge files', () => {
    expect(checkPhotoFile({ name: 'a.JPG', size: 5 })).toBeNull()
    expect(checkPhotoFile({ name: 'a.heic', size: 5 })).toMatch(/only jpg/)
    expect(checkPhotoFile({ name: 'noext', size: 5 })).toMatch(/only jpg/)
    expect(checkPhotoFile({ name: 'a.png', size: MAX_PHOTO_BYTES + 1 })).toMatch(/10 MB/)
  })
  it('asks for a token, uploads the file and returns the public link', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ path: 'p.jpg', token: 't', contentType: 'image/jpeg', publicUrl: 'https://x.supabase.co/p.jpg' }) })
    vi.stubGlobal('fetch', fetchMock)
    const up = vi.fn().mockResolvedValue({ error: null })
    const r = await uploadProductPhoto({ storage: { from: (b: string) => { expect(b).toBe('product-images'); return { uploadToSignedUrl: up } } } }, file('a.jpg'))
    expect(r).toEqual({ ok: true, url: 'https://x.supabase.co/p.jpg' })
    expect(up).toHaveBeenCalledWith('p.jpg', 't', expect.anything(), { contentType: 'image/jpeg' })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ filename: 'a.jpg' })
  })
  it('does not even ask for a token when the file is not allowed', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
    const r = await uploadProductPhoto({ storage: { from: () => ({ uploadToSignedUrl: vi.fn() }) } }, file('a.heic'))
    expect(r.ok).toBe(false); expect(fetchMock).not.toHaveBeenCalled()
  })
  it('reports a refused token and a failed upload without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Unauthorized' }) }))
    const st = { storage: { from: () => ({ uploadToSignedUrl: vi.fn() }) } }
    expect(await uploadProductPhoto(st, file('a.jpg'))).toEqual({ ok: false, message: '"a.jpg": Unauthorized' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ path: 'p', token: 't', contentType: 'image/jpeg', publicUrl: 'u' }) }))
    const bad = { storage: { from: () => ({ uploadToSignedUrl: vi.fn().mockResolvedValue({ error: { message: 'too big' } }) }) } }
    expect(await uploadProductPhoto(bad, file('a.jpg'))).toEqual({ ok: false, message: '"a.jpg": too big' })
  })
})
