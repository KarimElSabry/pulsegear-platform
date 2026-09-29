// src/content/testimonials.ts
// Real customer feedback (from Instagram and WhatsApp messages).
//
// HOW TO EDIT
//   - name:   set it to the customer's first name or initials (with their OK). While it is
//             empty the card shows "Verified customer", so nothing is published by mistake.
//   - quote:  the customer's own words. Do not embellish. Fix only obvious typos.
//   - translation: English version shown under Arabic quotes.
//   - Add, remove or reorder entries freely; the carousel adapts.
//
// Privacy: the screenshots had the customers' names blurred, so get their permission
// before adding a full name. Instagram @handles were left out on purpose.

export type Testimonial = {
  quote: string
  lang: 'ar' | 'en'
  translation?: string
  product: string
  source: 'Instagram' | 'WhatsApp'
  name: string // TODO: fill in, e.g. 'Omar S.'
  rating?: 1 | 2 | 3 | 4 | 5
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'I got a Garmin Forerunner 265 from Pulse Gear Egypt and the whole experience was great! It arrived really fast from abroad, and the condition was excellent, almost like new. I also got it for a much better price than usual. Thank you so much! Highly recommended.',
    lang: 'en',
    product: 'Garmin Forerunner 265',
    source: 'Instagram',
    name: '',
  },
  {
    quote:
      'تجربة ممتازة بصراحة! طلبت الـ Garmin Cirqa والتعامل كان محترم جدا وسريع. المنتج أصلي 100%، أنصح أي حد يتعامل معاهم.',
    lang: 'ar',
    translation:
      'Honestly an excellent experience! I ordered the Garmin Cirqa and the service was very respectful and fast. The product is 100% original. I recommend anyone to deal with them.',
    product: 'Garmin Cirqa Smart Band',
    source: 'WhatsApp',
    name: '',
    rating: 5,
  },
  {
    quote:
      'بصراحة انتوا ناس محترمين جدا والتزام في التعامل ومواعيدكم ممتازة. أنا طلبت الحزام ووصل بعدها بيومين بالظبط وكنتوا معايا بالتليفون، وأنا بوصله بالساعة الهواوي والحمد لله شغال كويس جدا. متشكر جدا جدا لحضراتكم وإن شاء الله بداية تعاون معاكم. ألف شكر.',
    lang: 'ar',
    translation:
      'Honestly, you are very respectful people, committed in how you deal, and your delivery times are excellent. I ordered the strap and it arrived exactly two days later, and you stayed in touch by phone. I pair it with my Huawei watch and, thank God, it works very well. Thank you so much, and God willing this is the start of working together. A thousand thanks.',
    product: 'Polar H10 heart rate strap',
    source: 'Instagram',
    name: '',
  },
  {
    quote:
      'الحقيقة أنا سعيد جدا بالتعامل معاكم، خصوصا مستر كريم، بجد متشكر. طلبت ساعة شبه صعب إنها تبقى موجودة في حالة كويسة، وحقيقي ماتأخرش وساعدني. وحقيقي تجربة عظيمة وأرشح لأي حد يسألني على حاجة التعامل معاكم. شكرا جدا.',
    lang: 'ar',
    translation:
      'Honestly I am very happy dealing with you, especially Mr. Karim, really thank you. I asked for a watch that is almost impossible to find in good condition, and he did not delay and helped me. A truly great experience, and I recommend dealing with you to anyone who asks me. Thank you so much.',
    product: 'Garmin Fenix 3 HR',
    source: 'Instagram',
    name: '',
  },
  {
    quote:
      'طلبت الـ Garmin Forerunner 265S ووصلتني في أسبوع، وسعرك مقارنة بباقي الناس كان مناسب جدا، وردك سريع ومتعاون. وأكيد هرشحك لو حد محتاج حاجة من طرفي. شكرا ليك.',
    lang: 'ar',
    translation:
      'I ordered the Garmin Forerunner 265S and it reached me within a week. Your price compared with other sellers was very reasonable, and your replies are fast and helpful. I will definitely recommend you if anyone needs something. Thank you.',
    product: 'Garmin Forerunner 265S',
    source: 'Instagram',
    name: '',
  },
  {
    quote:
      'شكرا جدا لتعاملكم، التجربة مميزة والساعة وصلت في وقت قصير. الساعة كويسة جدا.',
    lang: 'ar',
    translation:
      'Thank you very much for dealing with us. The experience was excellent and the watch arrived in a short time. The watch is in very good condition.',
    product: 'Garmin Forerunner 265',
    source: 'Instagram',
    name: '',
  },
  {
    quote: 'Amazing watch from Pulse Gear Egypt! 4k warm-up, then 3k + 2k + 1k @ 4:00.',
    lang: 'en',
    product: 'Running watch',
    source: 'Instagram',
    name: '',
  },
]
