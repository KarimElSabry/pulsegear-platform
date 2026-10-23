// src/lib/tour.ts
// Pure data and helpers for the welcome tour. No browser code here so it is easy to test.

export const TOUR_STORAGE_KEY = 'pg_tour_seen_v1'
export const TOUR_START_EVENT = 'pulsegear:start-tour'
export const DESKTOP_MIN_WIDTH = 1024 // matches Tailwind "lg", where the header shows the full menu

export type TourStep = {
  id: string
  title: string
  titleAr: string
  body: string
  bodyAr: string
  /** CSS selectors tried in order; the first visible match is highlighted. */
  desktop: string[]
  mobile: string[]
}

const MENU_BUTTON = 'header button[aria-label="Toggle menu"]'

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'products', title: 'Find your gear', titleAr: 'ابحث عن معدّاتك',
    body: 'Browse running watches, shoes and accessories from top brands. We source them from Europe for you.',
    bodyAr: 'تصفّح ساعات وأحذية وإكسسوارات الجري من أفضل الماركات. نحن نجلبها لك من أوروبا.',
    desktop: ['header nav a[href="/products"]'], mobile: [MENU_BUTTON],
  },
  {
    id: 'deals', title: 'Hot deals', titleAr: 'عروض ساخنة',
    body: 'The best prices of the moment live here. Deals change often, so check back.',
    bodyAr: 'أفضل الأسعار الحالية تجدها هنا. العروض تتغير باستمرار، فتابعها.',
    desktop: ['header nav a[href="/deals"]'], mobile: [MENU_BUTTON],
  },
  {
    id: 'request', title: 'Can’t find it? Request it', titleAr: 'لم تجد ما تريد؟ اطلبه',
    body: 'Tell us the product you want and we will find it and send you a price.',
    bodyAr: 'أخبرنا بالمنتج الذي تريده وسنبحث عنه ونرسل لك مجموعة عروض بأسعار مميزة!.',
    desktop: ['header nav a[href="/request-product"]'], mobile: [MENU_BUTTON],
  },
  {
    id: 'wishlist', title: 'Save and track', titleAr: 'احفظ وتابع',
    body: 'Use Wishlist to save items you like, and Track Order to follow your shipment with your order ID. No account needed for tracking.',
    bodyAr: 'استخدم قائمة الأمنيات لحفظ ما يعجبك، وتتبّع الطلب لمتابعة شحنتك برقم الطلب. لا تحتاج حساباً للتتبّع.',
    desktop: ['header nav a[href="/track-order"]', 'header nav a[href="/wishlist"]'], mobile: [MENU_BUTTON],
  },
  {
    id: 'login', title: 'Create an account', titleAr: 'أنشئ حساباً',
    body: 'Sign up or log in to keep your wishlist and see all your orders and their updates in one place.',
    bodyAr: 'سجّل أو سجّل الدخول لتحتفظ بقائمة أمنياتك وترى كل طلباتك وتحديثاتها في مكان واحد.',
    desktop: ['header a[href="/auth/signup"]', 'header a[href="/account"]'], mobile: [MENU_BUTTON],
  },
  {
    id: 'newsletter', title: 'Stay in the loop', titleAr: 'ابقَ على اطلاع',
    body: 'Join the newsletter to get new arrivals, hot deals and restocks by email.',
    bodyAr: 'اشترك في النشرة البريدية لتصلك المنتجات الجديدة والعروض وإعادة التوفر.',
    desktop: ['[data-tour="newsletter"] form'], mobile: ['[data-tour="newsletter"] form'],
  },
]

export function isDesktop(width: number): boolean {
  return width >= DESKTOP_MIN_WIDTH
}

export function selectorsFor(step: TourStep, width: number): string[] {
  return isDesktop(width) ? step.desktop : step.mobile
}

/** Mobile gets a plain-language hint because the menu is hidden behind the ☰ button. */
export function mobileHint(step: TourStep, width: number): { en: string; ar: string } | null {
  if (isDesktop(width) || step.id === 'newsletter') return null
  return { en: 'Tap the ☰ menu to open this.', ar: 'اضغط على قائمة ☰ لفتح هذا.' }
}

/** Only the homepage auto-starts, once, and never in the admin area. */
export function shouldAutoStart(pathname: string | null, seen: string | null): boolean {
  if (seen) return false
  return pathname === '/'
}

export function progressLabel(index: number, total: number): string {
  return `${index + 1} / ${total}`
}
