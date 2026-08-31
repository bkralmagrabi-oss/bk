import type { SiteContent } from "./content-types";

export const defaultContent: SiteContent = {
  hero: {
    eyebrow: { en: "WEB DESIGN STUDIO", ar: "استوديو تصميم مواقع" },
    title: {
      en: "We Design Digital Experiences That Inspire.",
      ar: "نصمم تجارب رقمية تلهم عملاءك.",
    },
    subtitle: {
      en: "Clean, modern and responsive websites that help individuals and businesses stand out.",
      ar: "مواقع إلكترونية عصرية وسريعة الاستجابة تساعد الأفراد والشركات على التميز.",
    },
  },
  services: [
    {
      id: "service-1",
      icon: "website",
      title: { en: "Websites", ar: "مواقع إلكترونية" },
      description: {
        en: "Fully custom business websites built to convert visitors into customers.",
        ar: "مواقع أعمال مخصصة بالكامل مصممة لتحويل الزوار إلى عملاء.",
      },
    },
    {
      id: "service-2",
      icon: "landing",
      title: { en: "Landing Pages", ar: "صفحات هبوط" },
      description: {
        en: "High-impact single pages designed for campaigns, launches, and offers.",
        ar: "صفحات مؤثرة مصممة خصيصًا للحملات الإعلانية والعروض وإطلاق المنتجات.",
      },
    },
    {
      id: "service-3",
      icon: "portfolio",
      title: { en: "Portfolios", ar: "معارض أعمال" },
      description: {
        en: "Elegant portfolio sites for creatives, freelancers, and professionals.",
        ar: "مواقع أنيقة لعرض أعمال المبدعين والمستقلين والمهنيين.",
      },
    },
    {
      id: "service-4",
      icon: "responsive",
      title: { en: "Responsive Design", ar: "تصميم متجاوب" },
      description: {
        en: "Every project looks and works flawlessly on any device or screen size.",
        ar: "كل مشروع يعمل ويظهر بشكل مثالي على جميع الأجهزة والشاشات.",
      },
    },
    {
      id: "service-5",
      icon: "support",
      title: { en: "Ongoing Support", ar: "دعم مستمر" },
      description: {
        en: "Updates, fixes, and improvements whenever your business needs them.",
        ar: "تحديثات وإصلاحات وتحسينات كلما احتاج عملك إليها.",
      },
    },
  ],
  portfolio: [
    {
      id: "project-1",
      title: { en: "Retail Storefront", ar: "متجر إلكتروني" },
      tag: { en: "E-Commerce Website", ar: "موقع تجارة إلكترونية" },
      imageUrl: null,
      link: null,
    },
    {
      id: "project-2",
      title: { en: "Studio Atelier", ar: "استوديو أتيليه" },
      tag: { en: "Portfolio Site", ar: "موقع معرض أعمال" },
      imageUrl: null,
      link: null,
    },
    {
      id: "project-3",
      title: { en: "Launch Day", ar: "يوم الإطلاق" },
      tag: { en: "Landing Page", ar: "صفحة هبوط" },
      imageUrl: null,
      link: null,
    },
    {
      id: "project-4",
      title: { en: "Horizon Consulting", ar: "هورايزن للاستشارات" },
      tag: { en: "Business Website", ar: "موقع أعمال" },
      imageUrl: null,
      link: null,
    },
  ],
  about: {
    text: {
      en: "BK Web Design is a boutique web design studio building fast, modern websites for individuals and companies. We focus on clean design, clear structure, and results — every project is built to help your brand look its best online.",
      ar: "بي كي لتصميم المواقع هو استوديو تصميم متخصص في بناء مواقع إلكترونية سريعة وعصرية للأفراد والشركات. نركز على التصميم النظيف والهيكلة الواضحة والنتائج — كل مشروع نبنيه ليجعل علامتك التجارية تبدو بأفضل شكل على الإنترنت.",
    },
    pillars: [
      {
        id: "pillar-1",
        title: { en: "Simple", ar: "بساطة" },
        description: {
          en: "Straightforward process, clear communication, no unnecessary complexity.",
          ar: "عملية واضحة وتواصل مباشر بدون أي تعقيد غير ضروري.",
        },
      },
      {
        id: "pillar-2",
        title: { en: "Clean", ar: "نقاء" },
        description: {
          en: "Minimal, purposeful design that lets your content and brand lead.",
          ar: "تصميم بسيط وهادف يترك المجال لمحتواك وهويتك ليتصدرا المشهد.",
        },
      },
      {
        id: "pillar-3",
        title: { en: "Impactful", ar: "تأثير" },
        description: {
          en: "Websites built to actually move your business forward.",
          ar: "مواقع مبنية لتدفع أعمالك فعليًا إلى الأمام.",
        },
      },
    ],
  },
  contact: {
    email: "B.60@msn.com",
    whatsapp: "https://wa.me/966535094964",
    instagram: "https://instagram.com/bk.webs",
    instagramHandle: "@bk.webs",
  },
  footer: {
    tagline: { en: "Simple. Clean. Impactful.", ar: "بساطة. نقاء. تأثير." },
  },
};
