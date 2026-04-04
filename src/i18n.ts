import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      "welcome": "Bienvenue sur e-Territoire AI",
      "citizen": "Espace Citoyen",
      "official": "Espace Fonctionnaire",
      "admin_central": "Admin Central",
      "super_admin": "Super-Admin",
      "login": "Connexion",
      "register": "Inscription",
      "name": "Nom",
      "surname": "Prénom",
      "email": "Email",
      "password": "Mot de passe",
      "phone": "Téléphone",
      "cnie": "CNIE",
      "grade": "Grade",
      "matricule": "Matricule",
      "city": "Ville",
      "submit": "Soumettre",
      "pending_approval": "Votre compte est en attente d'approbation.",
      "dashboard": "Tableau de Bord",
      "procedures": "Procédures Administratives",
      "urbanism": "Urbanisme",
      "civil_status": "État Civil",
      "legal_vulgarization": "FAQ & Vulgarisation Juridique",
      "scan_doc": "Scanner un document",
      "extracting": "Extraction des données...",
      "generate_doc": "Générer un document",
      "official_header": "Royaume du Maroc",
      "ministry_interior": "Ministère de l'Intérieur",
      "digital_identity": "Identité Numérique",
      "national_stats": "Statistiques Nationales",
      "validate_users": "Validation des Comptes",
      "my_dossiers": "Mes Dossiers"
    }
  },
  ar: {
    translation: {
      "welcome": "مرحباً بكم في e-Territoire AI",
      "citizen": "فضاء المواطن",
      "official": "فضاء الموظف",
      "admin_central": "المسؤول الإقليمي",
      "super_admin": "المسؤول المركزي",
      "login": "تسجيل الدخول",
      "register": "التسجيل",
      "name": "الاسم العائلي",
      "surname": "الاسم الشخصي",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "phone": "الهاتف",
      "cnie": "رقم البطاقة الوطنية",
      "grade": "الرتبة",
      "matricule": "رقم التأجير",
      "city": "المدينة",
      "submit": "إرسال",
      "pending_approval": "حسابك في انتظار الموافقة.",
      "dashboard": "لوحة القيادة",
      "procedures": "المساطر الإدارية",
      "urbanism": "التعمير",
      "civil_status": "الحالة المدنية",
      "legal_vulgarization": "التبسيط القانوني",
      "scan_doc": "مسح مستند",
      "extracting": "جاري استخراج البيانات...",
      "generate_doc": "إنشاء مستند",
      "official_header": "المملكة المغربية",
      "ministry_interior": "وزارة الداخلية",
      "digital_identity": "الهوية الرقمية",
      "national_stats": "الإحصائيات الوطنية",
      "validate_users": "المصادقة على الحسابات",
      "my_dossiers": "ملفاتي"
    }
  },
  tz: {
    translation: {
      "welcome": "ⴰⵏⵙⵓⴼ ⵖⵔ e-Territoire AI",
      "citizen": "ⴰⵎⵎⴰⵙ ⵏ ⵓⵎⵓⵔⵉ",
      "official": "ⴰⵎⵎⴰⵙ ⵏ ⵓⵏⴼⵍⵓⵙ",
      "admin_local": "ⴰⵎⵙⵙⵓⴳⵓⵔ ⴰⴷⵖⴰⵔⴰⵏ",
      "super_admin": "ⴰⵎⵙⵙⵓⴳⵓⵔ ⴰⵏⴰⵎⵎⴰⵙ",
      "login": "ⴽⵛⵎ",
      "register": "ⵣⵎⵎⴻⵎ",
      "name": "ⵉⵙⵎ",
      "surname": "ⵉⵙⵎ ⵏ ⵜⵡⴰⵛⵓⵏⵜ",
      "email": "ⵉⵎⴰⵢⵍ",
      "password": "ⵜⴰⵡⴰⵍⵜ ⵏ ⵓⵣⵔⴰⵢ",
      "phone": "ⵜⵉⵍⵉⴼⵓⵏ",
      "grade": "ⵜⴰⵙⴽⵯⴼⴰⵍⵜ",
      "matricule": "ⵓⵟⵟⵓⵏ ⵏ ⵓⵣⵎⵎⴻⵎ",
      "city": "ⵜⴰⵎⴷⵉⵏⵜ",
      "submit": "ⴰⵣⵏ",
      "pending_approval": "ⴰⵎⵉⴹⴰⵏ ⵏⵏⴽ ⵉⵇⵇⵍ ⵜⵓⵔⴰⴳⵜ.",
      "dashboard": "ⵜⴰⴼⵍⵡⵉⵜ ⵏ ⵜⵡⵓⵔⵉ",
      "procedures": "ⵜⵉⵎⵀⴰⵍⵉⵏ ⵜⵉⵎⵙⵙⵓⴳⵓⵔⵉⵏ",
      "urbanism": "ⴰⵙⵙⵏⵜⵉ",
      "civil_status": "ⵜⴰⴷⴷⴰⴷⵜ ⵜⴰⵎⵓⵔⵉⵜ",
      "legal_vulgarization": "ⴰⵙⴼⵔⵓ ⴰⵣⵔⴼⴰⵏ",
      "scan_doc": "ⵙⴽⴰⵏ ⵏ ⵜⴼⵔⵜ",
      "extracting": "ⴰⵙⵙⵓⴼⵖ ⵏ ⵉⵙⴼⴽⴰ...",
      "generate_doc": "ⴰⵙⵙⵓⴼⵖ ⵏ ⵜⴼⵔⵜ",
      "official_header": "ⵜⴰⴳⵍⴷⵉⵜ ⵏ ⵍⵎⵖⵔⵉⴱ",
      "ministry_interior": "ⵜⴰⵎⴰⵡⴰⵙⵜ ⵏ ⵓⴳⵏⵙⵓ",
      "digital_identity": "ⵜⴰⵎⴰⴳⵉⵜ ⵜⴰⵎⵓⵟⵟⵓⵏⵜ",
      "national_stats": "ⵜⵉⵙⵏⴰⴷⴷⴰⵏⵉⵏ ⵜⵉⵏⴰⵎⵓⵔⵉⵏ",
      "validate_users": "ⴰⵙⵙⵉⴷⵜ ⵏ ⵉⵎⵉⴹⴰⵏⵏ",
      "my_dossiers": "ⵉⴼⵓⵙⴰⵔ ⵉⵏⵓ"
    }
  },
  da: {
    translation: {
      "welcome": "Marhba bikom f e-Territoire AI",
      "citizen": "Blassa dyal l-mowatin",
      "official": "Blassa dyal l-mowaddaf",
      "admin_local": "Admin Local",
      "super_admin": "Super-Admin",
      "login": "Dkhol",
      "register": "T-sejjel",
      "name": "Kniya",
      "surname": "Smiya",
      "email": "Email",
      "password": "Mot de passe",
      "phone": "Tilifoun",
      "grade": "Grade",
      "matricule": "Matricule",
      "city": "Mdina",
      "submit": "Sift",
      "pending_approval": "L-compte dyalk f l-intidar dyal l-mowafaqqa.",
      "dashboard": "Dashboard",
      "procedures": "L-msater l-idariya",
      "urbanism": "Urbanisme",
      "civil_status": "L-hala l-madaniya",
      "legal_vulgarization": "T-basit l-qanouni",
      "scan_doc": "Scan document",
      "extracting": "Extraction dyal l-ma'loumat...",
      "generate_doc": "Générer document",
      "official_header": "L-mamlaka l-maghribiya",
      "ministry_interior": "Wizarat l-dakhiliya",
      "digital_identity": "Identité Numérique",
      "national_stats": "Ihsaiyat Wataniya",
      "validate_users": "Validation dyal l-comptes",
      "my_dossiers": "Dossiyat dyali"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
