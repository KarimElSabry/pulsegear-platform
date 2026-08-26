// app/faq/page.tsx

const conditions = [
  {
    label: "New",
    arLabel: "جديد",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    desc: "Brand-new, unused, unopened, in original packaging with all accessories.",
    arDesc:
      "جديد تمامًا، غير مستخدم، غير مفتوح، وفي عبوته الأصلية مع كل الملحقات.",
  },
  {
    label: "Like New",
    arLabel: "كالجديد",
    color: "text-green-400",
    dot: "bg-green-400",
    desc: "Unused, original condition, opened or without original packaging.",
    arDesc:
      "غير مستخدم وحالته الأصلية، لكن ممكن يكون اتفتح أو من غير العلبة الأصلية.",
  },
  {
    label: "Very Good",
    arLabel: "جيد جدًا",
    color: "text-blue-400",
    dot: "bg-blue-400",
    desc: "Gently-used, excellent condition, minor imperfections not affecting use or appearance.",
    arDesc:
      "مستخدم استخدام خفيف وحالته ممتازة، مع عيوب بسيطة لا تؤثر على الاستخدام أو الشكل.",
  },
  {
    label: "Good",
    arLabel: "جيد",
    color: "text-yellow-400",
    dot: "bg-yellow-400",
    desc: "Regularly-used, shows wear, still functions as intended.",
    arDesc:
      "مستخدم بشكل طبيعي، وعليه علامات استخدام، لكنه ما زال يعمل بشكل طبيعي.",
  },
  {
    label: "Satisfactory",
    arLabel: "مقبول",
    color: "text-orange-400",
    dot: "bg-orange-400",
    desc: "Well-used, clear signs of wear and imperfections, still works as intended.",
    arDesc:
      "مستخدم بشكل واضح وعليه علامات استخدام وعيوب ظاهرة، لكنه ما زال يعمل كما هو متوقع.",
  },
];

const faqs = [
  {
    section: "About Pulse Gear",
    arSection: "عن Pulse Gear",
    questions: [
      {
        q: "What is Pulse Gear?",
        arQ: "إيه هي Pulse Gear؟",
        type: "text",
        a: `Pulse Gear is an Egyptian platform dedicated to helping runners train smarter by providing premium running watches, heart rate monitors, accessories, and performance tools at competitive prices.

We carefully source products from trusted international marketplaces and handle the entire process — from sourcing and purchasing to shipping and delivery — making it easy for athletes in Egypt to access equipment that is often unavailable locally.`,
        arA: `Pulse Gear هي منصة مصرية هدفها تساعد العدائين يتمرنوا بشكل أذكى، من خلال توفير Running Watches وHeart Rate Monitors والإكسسوارات وأدوات الـPerformance بأسعار تنافسية.

إحنا بنهتم باختيار المنتجات من مصادر وأسواق موثوقة، وبنتولى العملية من أول البحث والشراء لحد الشحن والتوصيل، عشان نوفر للرياضيين في مصر معدات ممكن يكون صعب يلاقوها محليًا.`,
      },
      {
        q: "Why should I buy from Pulse Gear instead of ordering myself?",
        arQ: "ليه أشتري من Pulse Gear بدل ما أطلب بنفسي؟",
        type: "text",
        a: `We take care of everything for you:

• Product sourcing
• Communication with the seller
• International shipping
• Import process
• Delivery inside Egypt

Instead of dealing with multiple websites, shipping companies, customs, and payment methods, you only communicate with Pulse Gear.`,
        arA: `إحنا بنتولى كل حاجة بدل منك:

• البحث عن المنتج
• التواصل مع البائع
• الشحن الدولي
• إجراءات الاستيراد
• التوصيل داخل مصر

بدل ما تتعامل مع مواقع مختلفة وشركات شحن وجمارك وطرق دفع مختلفة، كل اللي عليك إنك تتعامل مع Pulse Gear.`,
      },
      {
        q: "Can you get products that are not listed on the website?",
        arQ: "ممكن توفروا منتج مش موجود على الموقع؟",
        type: "text",
        a: `Yes.

If you cannot find a product on our website, simply use the Request Product page or contact us through Instagram or WhatsApp.

We'll do our best to source it for you.`,
        arA: `أيوه.

لو مش لاقي المنتج اللي محتاجه على الموقع، استخدم صفحة Product Request أو كلمنا على Instagram أو WhatsApp.

وإحنا هنبذل أقصى جهدنا عشان نلاقيهولك.`,
      },
    ],
  },

  {
    section: "Products",
    arSection: "المنتجات",
    questions: [
      {
        q: "Are all products brand new?",
        arQ: "هل كل المنتجات جديدة؟",
        type: "text",
        a: `No.

We offer products in multiple conditions:

• New
• Like New
• Very Good
• Good
• Satisfactory

The condition is clearly displayed on every product page.`,
        arA: `لأ.

إحنا بنوفر منتجات بحالات مختلفة:

• New
• Like New
• Very Good
• Good
• Satisfactory

حالة كل منتج بتكون موضحة بشكل واضح في صفحة المنتج.`,
      },
      {
        q: "What do the product conditions mean?",
        arQ: "إيه معنى حالات المنتجات المختلفة؟",
        type: "conditions",
        a: "",
        arA: "",
      },
      {
        q: "Are used products tested?",
        arQ: "هل المنتجات المستعملة بيتم فحصها؟",
        type: "text",
        a: `Whenever possible, products are checked before being offered.

The product condition shown on the website reflects our evaluation together with the seller's description.`,
        arA: `كل ما يكون ده ممكن، بنحاول نتأكد من حالة المنتج قبل عرضه.

حالة المنتج اللي بتظهر على الموقع بتعتمد على تقييمنا بالإضافة لوصف البائع للمنتج.`,
      },
      {
        q: `Why are some products marked "Out of Stock"?`,
        arQ: 'ليه بعض المنتجات مكتوب عليها "Out of Stock"؟',
        type: "text",
        a: `Many products come from second-hand marketplaces where only one unit may be available.

If it has already been sold, it will appear as Out of Stock or be moved to our Sold Archive.`,
        arA: `منتجات كتير بنجيبها من أسواق الـ Second-Hand، وممكن يكون متاح منها قطعة واحدة بس.

لو المنتج اتباع، هيظهر على الموقع كـ Out of Stock أو ممكن ينتقل للـ Sold Archive.`,
      },
      {
        q: "What is the Sold Archive?",
        arQ: "إيه هو الـ Sold Archive؟",
        type: "text",
        a: `The Sold Archive shows products that have already been successfully sourced and sold.

It helps customers understand what kinds of products are available through Pulse Gear and demonstrates our sourcing history.`,
        arA: `الـ Sold Archive بيعرض المنتجات اللي قدرنا نوفرها وباعت بالفعل.

ده بيساعدك تعرف نوع المنتجات اللي بنقدر نوفرها من خلال Pulse Gear، وكمان بيوضح تاريخ المنتجات اللي قدرنا نوصلها لعملائنا.`,
      },
    ],
  },

  {
    section: "Pricing",
    arSection: "الأسعار",
    questions: [
      {
        q: "Why are your prices different?",
        arQ: "ليه أسعاركم ممكن تختلف عن السعر اللي بشوفه أونلاين؟",
        type: "text",
        a: `The price shown on Pulse Gear is the final estimated price for delivery to Egypt.

It includes everything needed to get the product to your door:

• International purchasing
• Shipping
• Import costs
• Operational costs

You do not need to calculate any additional expenses yourself.`,
        arA: `السعر اللي ظاهر على Pulse Gear هو السعر التقديري النهائي لتوصيل المنتج ليك في مصر.

السعر بيشمل التكاليف اللازمة عشان المنتج يوصل لحد بابك:

• الشراء من الخارج
• الشحن
• تكاليف الاستيراد
• التكاليف التشغيلية

مش محتاج تحسب التكاليف الإضافية بنفسك.`,
      },
      {
        q: "Which price should I trust?",
        arQ: "أعتمد على أنهي سعر؟",
        type: "text",
        a: `Always rely on the price displayed on Pulse Gear.

Marketplace prices may change frequently, while our displayed price reflects what you can expect to pay.`,
        arA: `اعتمد دائمًا على السعر الظاهر على Pulse Gear.

أسعار الـ Marketplaces ممكن تتغير بشكل مستمر، بينما السعر الظاهر عندنا بيوضح المبلغ المتوقع دفعه.`,
      },
    ],
  },

  {
    section: "Orders",
    arSection: "الطلبات",
    questions: [
      {
        q: "How do I reserve a product?",
        arQ: "إزاي أحجز منتج؟",
        type: "text",
        a: `Simply press the Reserve on WhatsApp button or contact us through Instagram.`,
        arA: `ببساطة اضغط على زر Reserve on WhatsApp أو كلمنا على Instagram.`,
      },
      {
        q: "How do I order?",
        arQ: "إزاي أطلب منتج؟",
        type: "text",
        a: `The process is simple:

1. Browse products
2. Reserve your product
3. We confirm availability
4. We purchase it
5. We ship it
6. We deliver it to you in Egypt`,
        arA: `العملية بسيطة:

1. اختار المنتج
2. احجز المنتج
3. بنتأكد من توفره
4. بنشتريه
5. بنشحنه
6. بنوصله ليك في مصر`,
      },
      {
        q: "Can I request multiple products?",
        arQ: "ممكن أطلب أكتر من منتج؟",
        type: "text",
        a: `Yes.

You can reserve multiple products or request products that are not currently listed.`,
        arA: `أيوه.

تقدر تحجز أكتر من منتج، أو تطلب منتجات مش موجودة حاليًا على الموقع.`,
      },
      {
        q: "Can I cancel my reservation?",
        arQ: "ممكن ألغي الحجز؟",
        type: "text",
        a: `Please contact us as soon as possible.

Cancellation depends on whether the purchasing process has already started.`,
        arA: `كلمنا في أسرع وقت ممكن.

إمكانية إلغاء الحجز بتعتمد على إذا كانت عملية الشراء بدأت بالفعل ولا لأ.`,
      },
    ],
  },

  {
    section: "Shipping",
    arSection: "الشحن والتوصيل",
    questions: [
      {
        q: "Do you ship across Egypt?",
        arQ: "بتوصلوا لكل محافظات مصر؟",
        type: "text",
        a: `Yes, we deliver to all governorates across Egypt.

Delivery to major cities such as Cairo and Alexandria is typically faster. Orders to other governorates may require additional time depending on the location.`,
        arA: `أيوه، بنوصل لكل محافظات مصر.

التوصيل للقاهرة والإسكندرية والمدن الرئيسية بيكون عادةً أسرع، بينما باقي المحافظات ممكن تحتاج وقت إضافي حسب المكان.`,
      },
      {
        q: "How long does delivery take?",
        arQ: "التوصيل بياخد قد إيه؟",
        type: "text",
        a: `Delivery generally takes between 1 to 2 weeks depending on the product source and international shipping process.

An estimated delivery timeframe will always be shared with you before confirming your order.`,
        arA: `التوصيل عادةً بياخد من أسبوع لأسبوعين حسب مصدر المنتج وإجراءات الشحن الدولي.

بنشارك معاك المدة التقديرية للتوصيل قبل تأكيد الطلب.`,
      },
    ],
  },

  {
    section: "Product Compatibility",
    arSection: "توافق المنتجات",
    questions: [
      {
        q: "Will this heart rate strap work with my watch?",
        arQ: "هل الـ Heart Rate Strap ده هيشتغل مع ساعتي؟",
        type: "text",
        a: `Each product page will indicate compatibility.

If you're unsure, contact us and we'll help you before placing an order.`,
        arA: `صفحة كل منتج بتوضح الأجهزة المتوافقة معاه.

لو مش متأكد، كلمنا قبل الطلب وإحنا هنساعدك تتأكد من التوافق.`,
      },
      {
        q: "Do you sell replacement straps?",
        arQ: "بتوفروا Replacement Straps؟",
        type: "text",
        a: `Yes.

We also source replacement chest straps and accessories whenever available.`,
        arA: `أيوه.

بنقدر نوفر Replacement Chest Straps وإكسسوارات تانية كل ما تكون متاحة.`,
      },
      {
        q: "Can you find accessories for my watch?",
        arQ: "ممكن توفروا إكسسوارات لساعتي؟",
        type: "text",
        a: `Absolutely.

If the accessory isn't listed, submit a Product Request and we'll do our best to source it for you.`,
        arA: `طبعًا.

لو الإكسسوار مش موجود على الموقع، ابعت Product Request وإحنا هنبذل أقصى جهدنا عشان نوفرهولك.`,
      },
    ],
  },

  {
    section: "Warranty & Returns",
    arSection: "الضمان والإرجاع",
    questions: [
      {
        q: "Do your products come with a warranty?",
        arQ: "هل المنتجات عليها ضمان؟",
        type: "text",
        a: `Warranty coverage depends on the product, its condition, and where it was originally purchased.

Any available warranty information will be clearly stated on the product page or communicated before confirming your order.`,
        arA: `الضمان بيعتمد على نوع المنتج، حالته، والمكان اللي اتشرى منه في الأصل.

أي معلومات متاحة عن الضمان هتكون موضحة في صفحة المنتج أو هنتواصل معاك بيها قبل تأكيد الطلب.`,
      },
      {
        q: "Do second-hand products come with a warranty?",
        arQ: "المنتجات الـ Second-Hand بيكون عليها ضمان؟",
        type: "text",
        a: `Second-hand products do not normally include a warranty or return policy.

Before purchasing a second-hand product, we ask the seller detailed questions about its condition, functionality, history, and any known issues.

If an extraordinary or previously undisclosed issue is discovered after purchase, the case will be assessed individually.`,
        arA: `المنتجات الـ Second-Hand عادةً مش بيكون عليها ضمان أو إمكانية إرجاع.

قبل ما نشتري المنتج، بنسأل البائع كل الأسئلة المهمة عن حالته، استخدامه، تاريخه، وأي مشاكل معروفة.

ولو ظهر بعد الشراء شيء استثنائي أو مشكلة ماكنتش موضحة قبل الشراء، بنراجع الحالة بشكل منفصل.`,
      },
      {
        q: "Can I return a second-hand product if I change my mind?",
        arQ: "ينفع أرجّع منتج Second-Hand لو غيرت رأيي؟",
        type: "text",
        a: `Generally, no.

Second-hand products are sourced as specific items based on their listed condition and the information available from the seller.

Because these items are often unique and purchased specifically for the customer, returns are not normally accepted simply because the customer changes their mind.

Any exceptional case will be assessed individually.`,
        arA: `غالبًا لأ.

منتجات الـ Second-Hand بتتجاب كمنتجات محددة بناءً على حالتها والمعلومات المتاحة من البائع.

وبما إن المنتجات دي غالبًا بتكون قطعة واحدة وبتتجاب مخصوص للعميل، فالإرجاع لمجرد تغيير الرأي مش بيكون متاح عادةً.

أي حالة استثنائية بنراجعها بشكل منفصل.`,
      },
      {
        q: "What happens if I discover a serious issue after buying a second-hand product?",
        arQ: "أعمل إيه لو اكتشفت مشكلة كبيرة بعد شراء منتج Second-Hand؟",
        type: "text",
        a: `Contact us as soon as possible and provide details of the issue.

We will review the product listing, the seller's description, the questions asked before purchase, and the circumstances of the issue.

If the issue appears to be extraordinary or significantly different from what was disclosed before purchase, the case will be assessed individually.`,
        arA: `كلمنا في أسرع وقت ممكن واشرح لنا المشكلة بالتفصيل.

هنراجع إعلان المنتج، ووصف البائع، والأسئلة اللي اتسأل عنها المنتج قبل الشراء، وظروف المشكلة.

لو المشكلة كانت استثنائية أو مختلفة بشكل كبير عن المعلومات اللي تم توضيحها قبل الشراء، هنراجع الحالة بشكل منفصل.`,
      },
      {
        q: "Do new products have a manufacturer's warranty?",
        arQ: "المنتجات الجديدة بيكون عليها ضمان من الشركة المصنعة؟",
        type: "text",
        a: `Some new products may have a manufacturer's warranty depending on the original retailer, brand, and purchase date.

For products purchased from known retailers such as Garmin or Polar, we keep the original purchase receipt whenever possible.

If warranty coverage is available, we will communicate the relevant information before confirming the order.`,
        arA: `بعض المنتجات الجديدة ممكن يكون عليها ضمان من الشركة المصنعة، وده بيعتمد على المتجر الأصلي والـ Brand وتاريخ الشراء.

بالنسبة للمنتجات اللي بنشتريها من Retailers معروفين زي Garmin أو Polar، بنحتفظ بالفاتورة الأصلية كل ما يكون ده ممكن.

ولو فيه ضمان متاح، هنوضح لك المعلومات الخاصة بيه قبل تأكيد الطلب.`,
      },
      {
        q: "How can I use the manufacturer's warranty?",
        arQ: "أستخدم ضمان الشركة المصنعة إزاي؟",
        type: "text",
        a: `If a product is covered by a manufacturer's warranty, the manufacturer or authorized service provider normally handles the warranty claim.

For eligible purchases, you may request the original purchase receipt from us so you can contact the manufacturer or retailer directly.

We can provide the available purchase documentation when possible.`,
        arA: `لو المنتج عليه ضمان من الشركة المصنعة، عادةً الشركة المصنعة أو مركز الخدمة المعتمد هو اللي بيتولى طلب الضمان.

بالنسبة للمشتريات المؤهلة، تقدر تطلب مننا الفاتورة الأصلية عشان تتواصل مباشرةً مع الشركة المصنعة أو الـ Retailer.

وبنوفر لك مستندات الشراء المتاحة كل ما يكون ده ممكن.`,
      },
      {
        q: "Do I need the original purchase receipt?",
        arQ: "هل محتاج الفاتورة الأصلية؟",
        type: "text",
        a: `The original purchase receipt may be required by the manufacturer or retailer when submitting a warranty claim.

For new products purchased from retailers such as Garmin or Polar, we keep purchase documentation whenever possible and can provide a copy when available.`,
        arA: `ممكن الشركة المصنعة أو الـ Retailer يطلبوا الفاتورة الأصلية عند تقديم طلب ضمان.

بالنسبة للمنتجات الجديدة اللي بنشتريها من Retailers زي Garmin أو Polar، بنحتفظ بمستندات الشراء كل ما يكون ده ممكن، ونقدر نوفر لك نسخة لما تكون متاحة.`,
      },
      {
        q: "Does Pulse Gear provide its own warranty?",
        arQ: "هل Pulse Gear نفسها بتقدم ضمان؟",
        type: "text",
        a: `Pulse Gear does not automatically provide a separate warranty on every product.

Warranty coverage depends on the product and its original source.

Any specific warranty coverage or documentation available for a product will be communicated before the order is confirmed.`,
        arA: `Pulse Gear مش بتقدم تلقائيًا ضمان منفصل لكل المنتجات.

الضمان بيعتمد على المنتج ومصدره الأصلي.

أي ضمان أو مستندات متاحة لمنتج معين هنتواصل معاك بيها قبل تأكيد الطلب.`,
      },
      {
        q: "What if the manufacturer refuses my warranty claim?",
        arQ: "أعمل إيه لو الشركة المصنعة رفضت طلب الضمان؟",
        type: "text",
        a: `Manufacturer warranty decisions are made by the manufacturer or authorized service provider according to their warranty terms.

If you believe there is an issue with the decision, contact us and we can review the purchase documentation and circumstances with you.

Each case will be handled based on the applicable warranty terms and available documentation.`,
        arA: `قرار قبول أو رفض الضمان بيكون من الشركة المصنعة أو مركز الخدمة المعتمد، وبيتم حسب شروط الضمان الخاصة بيهم.

لو شايف إن فيه مشكلة في القرار، تقدر تتواصل معانا ونراجع معاك مستندات الشراء وظروف الحالة.

كل حالة هتتعامل حسب شروط الضمان والمستندات المتاحة.`,
      },
      {
        q: "What is the difference between a warranty and a return?",
        arQ: "إيه الفرق بين الضمان والإرجاع؟",
        type: "text",
        a: `A warranty generally covers eligible product defects or failures under the manufacturer's warranty terms.

A return is the process of sending a product back after purchase.

Warranty coverage does not automatically mean that a product can be returned to Pulse Gear, and return eligibility depends on the product type, condition, and circumstances of the purchase.`,
        arA: `الضمان عادةً بيغطي عيوب أو أعطال معينة في المنتج حسب شروط الشركة المصنعة.

أما الإرجاع فهو إنك ترجع المنتج بعد الشراء.

وجود ضمان على المنتج مش معناه تلقائيًا إنك تقدر ترجعه لـ Pulse Gear، وإمكانية الإرجاع بتعتمد على نوع المنتج وحالته وظروف الشراء.`,
      },
    ],
  },

  {
    section: "Payments",
    arSection: "الدفع",
    questions: [
      {
        q: "How do I pay?",
        arQ: "إزاي أدفع؟",
        type: "text",
        a: `Payment is split into two parts:

• 50% upfront before we ship the product; via Instapay or bank transfer
• 50% cash on delivery when the product arrives to you`,
        arA: `الدفع بيتقسم لجزئين:

• 50% مقدم قبل شحن المنتج عن طريق Instapay أو تحويل بنكي
• 50% كاش عند استلام المنتج`,
      },
      {
        q: "Do I pay before you purchase the product?",
        arQ: "هل بدفع قبل ما تشتروا المنتج؟",
        type: "text",
        a: `Yes, a 50% deposit is required before we proceed with shipping.

We will walk you through the full payment process after confirming your order.`,
        arA: `أيوه، بيكون فيه مقدم 50% قبل ما نبدأ عملية الشحن.

هنوضح لك خطوات الدفع كاملة بعد تأكيد طلبك.`,
      },
    ],
  },

  {
    section: "Wishlist",
    arSection: "قائمة المفضلة",
    questions: [
      {
        q: "What is the Wishlist?",
        arQ: "إيه هي الـ Wishlist؟",
        type: "text",
        a: `Wishlist allows you to save products that you're interested in and revisit them later.`,
        arA: `الـ Wishlist بتسمح لك تحفظ المنتجات اللي مهتم بيها وترجع لها بعدين.`,
      },
      {
        q: "Does adding a product to my Wishlist reserve it?",
        arQ: "لو ضفت منتج للـ Wishlist كده المنتج اتحجز؟",
        type: "text",
        a: `No.

Wishlist only saves the product for you. Products remain available to other customers until formally reserved.`,
        arA: `لأ.

الـ Wishlist بس بتحفظ المنتج عندك. المنتج بيفضل متاح لعملاء تانيين لحد ما يتم حجزه بشكل رسمي.`,
      },
    ],
  },

  {
    section: "Contact",
    arSection: "التواصل",
    questions: [
      {
        q: "How can I contact Pulse Gear?",
        arQ: "أتواصل مع Pulse Gear إزاي؟",
        type: "text",
        a: `You can reach us through:

• Instagram
• WhatsApp
• Product Request page`,
        arA: `تقدر تتواصل معانا عن طريق:

• Instagram
• WhatsApp
• صفحة Product Request`,
      },
      {
        q: "I still have questions. What should I do?",
        arQ: "لسه عندي أسئلة، أعمل إيه؟",
        type: "text",
        a: `We're always happy to help.

Contact us through WhatsApp or Instagram, and we'll guide you to the right product.`,
        arA: `دايمًا يسعدنا نساعدك.

تقدر تكلمنا على WhatsApp أو Instagram، وإحنا هنساعدك تختار المنتج المناسب ليك أو نلاقيهولك لو مش موجود.`,
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ===== HEADER ===== */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-red-500">
          Got Questions?
        </span>

        <h1 className="text-5xl font-black uppercase mt-3 mb-4">
          Frequently Asked Questions
        </h1>

        <p className="text-zinc-300 text-lg">
          Everything you need to know about Pulse Gear, our products, and how we work.
        </p>

        {/* Arabic — pure Arabic, dir="rtl" */}
        <p
          dir="rtl"
          className="text-zinc-300 text-sm mt-3 leading-relaxed"
        >
          كل اللي محتاج تعرفه عن Pulse Gear، منتجاتنا، وطريقة شغلنا.
        </p>
      </section>

      {/* ===== FAQ SECTIONS ===== */}
      <section className="max-w-3xl mx-auto px-6 pb-20 flex flex-col gap-16">
        {faqs.map((section) => (
          <div key={section.section}>

            {/* Section Title — English ltr, Arabic rtl */}
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-red-500">
                {section.section}
              </h2>

              <h3
                dir="rtl"
                className="text-sm font-semibold text-zinc-300 mt-1"
              >
                {section.arSection}
              </h3>
            </div>

            {/* Questions */}
            <div className="flex flex-col gap-px">
              {section.questions.map((item, i) => (
                <details
                  key={i}
                  className="group border-t border-zinc-800 last:border-b last:border-zinc-800"
                >

                  <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none">
                    <div className="flex-1">

                      {/* English question — ltr */}
                      <span
                        dir="ltr"
                        className="text-base font-semibold text-white group-open:text-red-400 transition-colors duration-200 block"
                      >
                        {item.q}
                      </span>

                      {/* Arabic question — rtl, mixed content uses dir="rtl" */}
                      <span
                        dir="rtl"
                        className="text-sm text-zinc-300 mt-1 block leading-relaxed"
                      >
                        {item.arQ}
                      </span>
                    </div>

                    <span className="text-zinc-400 group-open:text-red-500 transition-colors duration-200 text-xl shrink-0">
                      +
                    </span>
                  </summary>

                  <div className="pb-6">

                    {/* ── Conditions Layout ── */}
                    {item.type === "conditions" ? (

                      <div className="flex flex-col gap-3">
                        {conditions.map((c) => (
                          <div
                            key={c.label}
                            className="flex gap-3 items-start bg-zinc-800/50 rounded-xl px-4 py-3 border border-zinc-700/50"
                          >
                            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${c.dot}`} />

                            <div className="flex flex-col gap-0.5 w-full">

                              {/* Label row — English ltr, Arabic rtl, no dash */}
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold ${c.color}`}>
                                  {c.label}
                                </span>
                                <span
                                  dir="rtl"
                                  className="text-xs font-semibold text-zinc-300"
                                >
                                  {c.arLabel}
                                </span>
                              </div>

                              {/* English description — ltr */}
                              <span
                                dir="ltr"
                                className="text-xs text-zinc-300 leading-relaxed"
                              >
                                {c.desc}
                              </span>

                              {/* Arabic description — rtl */}
                              <span
                                dir="rtl"
                                className="text-xs text-zinc-300 leading-relaxed mt-1"
                              >
                                {c.arDesc}
                              </span>

                            </div>
                          </div>
                        ))}
                      </div>

                    ) : (

                      <>
                        {/* English Answer — ltr */}
                        <div
                          dir="ltr"
                          className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line"
                        >
                          {item.a}
                        </div>

                        {/* Arabic Answer — rtl, mixed content handled by dir="rtl" */}
                        <div
                          dir="rtl"
                          className="mt-5 pt-5 border-t border-zinc-800/70 text-zinc-300 text-sm leading-relaxed whitespace-pre-line"
                        >
                          {item.arA}
                        </div>
                      </>

                    )}

                  </div>

                </details>
              ))}
            </div>

          </div>
        ))}
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="border-t border-zinc-800 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-5">

          <h2 className="text-3xl font-black uppercase">
            Don't See Your Question?
          </h2>

          {/* Arabic — rtl */}
          <p
            dir="rtl"
            className="text-zinc-300 text-sm leading-relaxed"
          >
            مش لاقي إجابة على سؤالك؟
          </p>

          {/* English — ltr */}
          <p
            dir="ltr"
            className="text-zinc-300 text-base leading-relaxed"
          >
            Our goal is to make buying running gear simple and hassle-free.
            If you couldn't find the answer you're looking for, send us a
            message on WhatsApp or Instagram; we'll be happy to help you
            find the right product or source equipment that isn't currently
            listed on the website.
          </p>

          {/* Arabic — rtl */}
          <p
            dir="rtl"
            className="text-zinc-300 text-sm leading-relaxed"
          >
            هدفنا نخلي شراء الـ Running Gear أبسط وأسهل. لو مش لاقي إجابة
            لسؤالك، ابعتلنا على WhatsApp أو Instagram وإحنا هنساعدك تختار
            المنتج المناسب أو نحاول نوفر لك منتج مش موجود حاليًا على الموقع.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <a
              href="https://wa.me/+201205322444"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              WhatsApp Us
            </a>

            <a
              href="https://instagram.com/pulsegear_egypt"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Instagram
            </a>
          </div>

        </div>
      </section>

    </main>
  );
}