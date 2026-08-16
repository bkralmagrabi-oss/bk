(function () {
  "use strict";

  var translations = {
    en: {
      skip_link: "Skip to content",
      nav_home: "Home",
      nav_services: "Services",
      nav_portfolio: "Portfolio",
      nav_about: "About",
      nav_contact: "Contact",

      hero_eyebrow: "WEB DESIGN STUDIO",
      hero_title: "We Design Digital Experiences That Inspire.",
      hero_subtitle: "Clean, modern and responsive websites that help individuals and businesses stand out.",
      hero_cta: "Let's Work Together",
      hero_cta_secondary: "View Our Work",

      services_eyebrow: "WHAT WE DO",
      services_title: "Services",
      services_subtitle: "Everything you need to launch a website that works as hard as you do.",
      service1_title: "Websites",
      service1_desc: "Fully custom business websites built to convert visitors into customers.",
      service2_title: "Landing Pages",
      service2_desc: "High-impact single pages designed for campaigns, launches, and offers.",
      service3_title: "Portfolios",
      service3_desc: "Elegant portfolio sites for creatives, freelancers, and professionals.",
      service4_title: "Responsive Design",
      service4_desc: "Every project looks and works flawlessly on any device or screen size.",
      service5_title: "Ongoing Support",
      service5_desc: "Updates, fixes, and improvements whenever your business needs them.",

      portfolio_eyebrow: "SELECTED WORK",
      portfolio_title: "Portfolio",
      portfolio_subtitle: "A few sample projects — real case studies coming soon.",
      project1_title: "Retail Storefront",
      project1_tag: "E-Commerce Website",
      project2_title: "Studio Atelier",
      project2_tag: "Portfolio Site",
      project3_title: "Launch Day",
      project3_tag: "Landing Page",
      project4_title: "Horizon Consulting",
      project4_tag: "Business Website",

      about_eyebrow: "ABOUT US",
      about_title: "Simple. Clean. Impactful.",
      about_text: "BK Web Design is a boutique web design studio building fast, modern websites for individuals and companies. We focus on clean design, clear structure, and results — every project is built to help your brand look its best online.",
      about_pillar1_title: "Simple",
      about_pillar1_desc: "Straightforward process, clear communication, no unnecessary complexity.",
      about_pillar2_title: "Clean",
      about_pillar2_desc: "Minimal, purposeful design that lets your content and brand lead.",
      about_pillar3_title: "Impactful",
      about_pillar3_desc: "Websites built to actually move your business forward.",

      contact_eyebrow: "GET IN TOUCH",
      contact_title: "Let's Work Together",
      contact_subtitle: "Tell us about your project and we'll get back to you shortly.",
      contact_or: "Or reach us directly",
      whatsapp_label: "Chat on WhatsApp",
      form_name: "Name",
      form_email: "Email",
      form_message: "Message",
      form_name_ph: "Your name",
      form_email_ph: "your@email.com",
      form_message_ph: "Tell us about your project...",
      form_submit: "Send Message",

      footer_tagline: "Simple. Clean. Impactful.",
      footer_rights: "All rights reserved."
    },
    ar: {
      skip_link: "الانتقال إلى المحتوى",
      nav_home: "الرئيسية",
      nav_services: "خدماتنا",
      nav_portfolio: "أعمالنا",
      nav_about: "من نحن",
      nav_contact: "تواصل معنا",

      hero_eyebrow: "استوديو تصميم مواقع",
      hero_title: "نصمم تجارب رقمية تلهم عملاءك.",
      hero_subtitle: "مواقع إلكترونية عصرية وسريعة الاستجابة تساعد الأفراد والشركات على التميز.",
      hero_cta: "لنعمل معًا",
      hero_cta_secondary: "شاهد أعمالنا",

      services_eyebrow: "ماذا نقدم",
      services_title: "خدماتنا",
      services_subtitle: "كل ما تحتاجه لإطلاق موقع يعمل بجد من أجل نجاحك.",
      service1_title: "مواقع إلكترونية",
      service1_desc: "مواقع أعمال مخصصة بالكامل مصممة لتحويل الزوار إلى عملاء.",
      service2_title: "صفحات هبوط",
      service2_desc: "صفحات مؤثرة مصممة خصيصًا للحملات الإعلانية والعروض وإطلاق المنتجات.",
      service3_title: "معارض أعمال",
      service3_desc: "مواقع أنيقة لعرض أعمال المبدعين والمستقلين والمهنيين.",
      service4_title: "تصميم متجاوب",
      service4_desc: "كل مشروع يعمل ويظهر بشكل مثالي على جميع الأجهزة والشاشات.",
      service5_title: "دعم مستمر",
      service5_desc: "تحديثات وإصلاحات وتحسينات كلما احتاج عملك إليها.",

      portfolio_eyebrow: "أعمال مختارة",
      portfolio_title: "أعمالنا",
      portfolio_subtitle: "نماذج مبدئية من أعمالنا — دراسات حالة حقيقية قريبًا.",
      project1_title: "متجر إلكتروني",
      project1_tag: "موقع تجارة إلكترونية",
      project2_title: "استوديو أتيليه",
      project2_tag: "موقع معرض أعمال",
      project3_title: "يوم الإطلاق",
      project3_tag: "صفحة هبوط",
      project4_title: "هورايزن للاستشارات",
      project4_tag: "موقع أعمال",

      about_eyebrow: "من نحن",
      about_title: "بساطة. نقاء. تأثير.",
      about_text: "بي كي لتصميم المواقع هو استوديو تصميم متخصص في بناء مواقع إلكترونية سريعة وعصرية للأفراد والشركات. نركز على التصميم النظيف والهيكلة الواضحة والنتائج — كل مشروع نبنيه ليجعل علامتك التجارية تبدو بأفضل شكل على الإنترنت.",
      about_pillar1_title: "بساطة",
      about_pillar1_desc: "عملية واضحة وتواصل مباشر بدون أي تعقيد غير ضروري.",
      about_pillar2_title: "نقاء",
      about_pillar2_desc: "تصميم بسيط وهادف يترك المجال لمحتواك وهويتك ليتصدرا المشهد.",
      about_pillar3_title: "تأثير",
      about_pillar3_desc: "مواقع مبنية لتدفع أعمالك فعليًا إلى الأمام.",

      contact_eyebrow: "تواصل معنا",
      contact_title: "لنعمل معًا",
      contact_subtitle: "أخبرنا عن مشروعك وسنعاود التواصل معك في أقرب وقت.",
      contact_or: "أو تواصل معنا مباشرة",
      whatsapp_label: "تواصل عبر واتساب",
      form_name: "الاسم",
      form_email: "البريد الإلكتروني",
      form_message: "الرسالة",
      form_name_ph: "اسمك",
      form_email_ph: "your@email.com",
      form_message_ph: "أخبرنا عن مشروعك...",
      form_submit: "إرسال الرسالة",

      footer_tagline: "بساطة. نقاء. تأثير.",
      footer_rights: "جميع الحقوق محفوظة."
    }
  };

  var html = document.documentElement;

  function applyTranslations(lang) {
    var dict = translations[lang];

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });
  }

  function setLanguage(lang) {
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    applyTranslations(lang);
    try { localStorage.setItem("bk_lang", lang); } catch (e) {}
  }

  var langToggle = document.getElementById("lang-toggle");
  langToggle.addEventListener("click", function () {
    var current = html.getAttribute("lang") === "ar" ? "en" : "ar";
    setLanguage(current);
  });

  var savedLang = null;
  try { savedLang = localStorage.getItem("bk_lang"); } catch (e) {}
  setLanguage(savedLang === "ar" ? "ar" : "en");

  // Mobile nav
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");
  navToggle.addEventListener("click", function () {
    var isOpen = siteNav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      siteNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Contact form -> mailto
  var form = document.getElementById("contact-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();

    var subject = "New project inquiry from " + name;
    var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;

    var mailto = "mailto:hello@bakerk.dev" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    window.location.href = mailto;
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();
