import { mutation } from "./_generated/server";

export const seedDatabase = mutation(async (ctx) => {
  const existing = await ctx.db
    .query("siteSettings")
    .filter((q) => q.eq(q.field("key"), "main"))
    .first();

  if (existing) return { seeded: false, reason: "already exists" };

  await ctx.db.insert("siteSettings", {
    key: "main",
    heroContent: {
      heading_en: "Baked with Love,\nShared with Joy",
      heading_ar: "مخبوز بالحب،\nمشارك بالفرح",
      subheading_en:
        "Discover our handcrafted artisan breads and pastries made with the finest ingredients",
      subheading_ar:
        "اكتشف خبزنا الحرفي ومعجناتنا المصنوعة يدويًا بأفضل المكونات",
      ctaLabel_en: "View Our Menu",
      ctaLabel_ar: "عرض القائمة",
      imageUrl: null,
    },
    aboutContent: {
      heading_en: "Our Story",
      heading_ar: "قصتنا",
      bio_en:
        "With over 15 years of experience in artisan baking, our chef brings passion and precision to every creation. We source the finest organic ingredients and traditional techniques to craft breads and pastries that delight the senses.",
      bio_ar:
        "مع أكثر من 15 عامًا من الخبرة في الخبز الحرفي، يضع الشيف شغفه ودقته في كل إبداع. نستخدم أفضل المكونات العضوية والتقنيات التقليدية لصنع خبز ومعجنات تُبهج الحواس.",
      imageUrl: null,
      skills: [
        "Artisan Bread Baking",
        "French Patisserie",
        "Custom Cake Design",
        "Sourdough Fermentation",
      ],
    },
    contactInfo: {
      phone: "+1 (555) 123-4567",
      email: "hello@chefamira.com",
      instagram: "@chefamira",
      address_en: "123 Baker Street, New York, NY 10001",
      address_ar: "١٢٣ شارع بيكر، نيويورك",
      bookingUrl: null,
    },
    updatedAt: Date.now(),
  });

  const menuData = [
    {
      name_en: "Classic Croissant",
      name_ar: "كرواسون كلاسيك",
      description_en: "Buttery, flaky French pastry with a golden crust",
      description_ar: "معجنات فرنسية هشة بالزبدة بقشرة ذهبية",
      price: 4.99,
      category: "pastries" as const,
      isAvailable: true,
      order: 0,
    },
    {
      name_en: "Pain au Chocolat",
      name_ar: "خبز بالشوكولاتة",
      description_en: "Laminated dough filled with dark chocolate batons",
      description_ar: "عجين هش محشي بأصابع الشوكولاتة الداكنة",
      price: 5.49,
      category: "pastries" as const,
      isAvailable: true,
      order: 1,
    },
    {
      name_en: "Signature Sourdough",
      name_ar: "خبز السوردو",
      description_en: "Slow-fermented organic sourdough with a crisp crust",
      description_ar: "خبز سوردو عضوي مخمر ببطء بقشرة مقرمشة",
      price: 8.99,
      category: "cakes" as const,
      isAvailable: true,
      order: 2,
    },
    {
      name_en: "Chocolate Layer Cake",
      name_ar: "كيك الشوكولاتة الطبقي",
      description_en: "Rich Belgian chocolate with silky ganache frosting",
      description_ar: "شوكولاتة بلجيكية غنية بطبقة غاناش حريرية",
      price: 6.99,
      category: "cakes" as const,
      isAvailable: true,
      order: 3,
    },
    {
      name_en: "Almond Biscotti",
      name_ar: "بسكوتي اللوز",
      description_en: "Twice-baked Italian cookies with toasted almonds",
      description_ar: "بسكويت إيطالي مخبوز مرتين مع اللوز المحمص",
      price: 3.99,
      category: "cookies" as const,
      isAvailable: true,
      order: 4,
    },
    {
      name_en: "Salted Chocolate Chip",
      name_ar: "بسكويت شوكولاتة بالملح",
      description_en: "Classic cookie with sea salt and dark chocolate chunks",
      description_ar: "بسكويت كلاسيكي بملح البحر وقطع الشوكولاتة الداكنة",
      price: 3.49,
      category: "cookies" as const,
      isAvailable: true,
      order: 5,
    },
  ];

  const now = Date.now();
  for (const item of menuData) {
    await ctx.db.insert("menuItems", { ...item, createdAt: now, imageUrl: null });
  }

  const testimonialData = [
    {
      quote_en: "The best sourdough I've ever had outside of Paris! Every visit is a delight.",
      quote_ar: "أفضل خبز سوردو تذوقته خارج باريس! كل زيارة هي متعة.",
      customerName: "Sarah M.",
      rating: 5,
      isVisible: true,
    },
    {
      quote_en: "Their croissants are perfectly laminated — light, flaky, and buttery. A true craft.",
      quote_ar: "الكرواسون عندهم مثالي — خفيف وهش ومذاق الزبدة رائع. حرفة حقيقية.",
      customerName: "James K.",
      rating: 5,
      isVisible: true,
    },
    {
      quote_en: "We ordered a custom cake for our wedding and it was absolutely stunning. Highly recommended!",
      quote_ar: "طلبنا كيك مخصص لزواجنا وكان رائعًا جدًا. أنصح بشدة!",
      customerName: "Layla & Omar",
      rating: 5,
      isVisible: true,
    },
  ];

  for (const testimonial of testimonialData) {
    await ctx.db.insert("testimonials", { ...testimonial, createdAt: now });
  }

  return { seeded: true };
});
