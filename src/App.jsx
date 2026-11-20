import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import {
  Sparkles,
  Download,
  Eye,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FileText,
  Palette,
  Camera,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  Loader2,
  CloudCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award
} from 'lucide-react';

// --- FIREBASE & GEMINI CONFIGURATION (.env uchun moslashtirilgan) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const appId = 'ai-resume-builder-uz';

let app, auth, db;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err) {
  console.warn('Firebase init skipped (add .env keys):', err);
}

// --- TRANSLATIONS (O'Z, RU, EN) ---
const TRANSLATIONS = {
  uz: {
    appTitle: 'AI Rezyume Ustasi',
    tabResume: 'Rezyume',
    tabCoverLetter: 'Hamroh xat (Cover Letter)',
    previewBtn: "Ko'rish",
    downloadPdf: 'PDF yuklab olish',
    saved: 'Saqlandi',
    saving: 'Saqlanmoqda...',
    localSaved: 'Lokal saqlandi',
    personalInfo: "Shaxsiy ma'lumotlar",
    uploadPhoto: 'Rasm yuklash',
    changePhoto: "Rasmni o'zgartirish",
    fullName: "To'liq ism-sharif",
    fullNamePh: 'Masalan: Alisher Valiyev',
    jobTitle: 'Mutaxassislik / Lavozim',
    jobTitlePh: 'Masalan: Frontend Dasturchi',
    email: 'Elektron pochta',
    emailPh: 'example@mail.com',
    phone: 'Telefon raqam',
    phonePh: '+998 90 123 45 67',
    address: 'Manzil',
    addressPh: "Toshkent sh., O'zbekiston",
    birthDate: "Tug'ilgan yil / sana",
    birthDatePh: '15.05.2002',
    summaryTitle: 'Qisqacha tavsif (Oʻzingiz haqingizda)',
    summaryPh: "Tajribangiz, maqsadlaringiz va asosiy yutuqlaringiz haqida yozing...",
    aiGenerateSummary: 'AI bilan yozish',
    aiImprove: 'AI bilan yaxshilash',
    experienceTitle: 'Ish tajribasi',
    addExperience: "+ Ish joyi qo'shish",
    company: 'Kompaniya nomi',
    companyPh: 'Kompaniya yoki tashkilot',
    position: 'Lavozim',
    positionPh: 'Egallagan lavozimingiz',
    period: 'Davr (yil)',
    periodPh: '2023 - Hozirgacha',
    description: 'Vazifalar va yutuqlar',
    descriptionPh: 'Asosiy bajargan ishlaringiz va erishgan natijalaringiz...',
    aiGenerateBullets: 'AI tavsif yaratish',
    educationTitle: "Ta'lim",
    addEducation: "+ O'quv yurti qo'shish",
    institution: "O'quv muassasasi",
    institutionPh: 'Universitet yoki kollej nomi',
    degree: "Yo'nalish / Daraja",
    degreePh: 'Bakalavr, Kompyuter injiniringi',
    eduYear: 'Bitirgan yili',
    eduYearPh: '2020 - 2024',
    skillsTitle: "Ko'nikmalar va Kuchli tomonlar",
    skillPh: "Ko'nikma yozing (masalan: React, Ingliz tili)...",
    addSkillBtn: "Qo'shish",
    aiSuggestSkills: 'AI kuchli tomonlarni ajratish',
    designTitle: 'Dizayn shabloni va Ranglar',
    templateMinimalist: 'Minimalist',
    templateClassic: 'Klassik',
    templateModern: 'Zamonaviy',
    accentColor: 'Asosiy rang',
    // Cover Letter
    clTitle: 'Hamroh xat (Cover Letter) yaratish',
    clSubtitle: "Rezyume ma'lumotlaringiz asosida ish beruvchiga moslashtirilgan xat",
    targetCompany: 'Qaysi kompaniyaga topshirmoqdasiz?',
    targetCompanyPh: 'Kompaniya nomi',
    targetRole: 'Qaysi lavozimga?',
    targetRolePh: 'Lavozim nomi',
    jobDetails: "Vakansiya talablari (ixtiyoriy)",
    jobDetailsPh: "Vakansiya matnini yoki asosiy talablarni shu yerga qo'ying...",
    generateClBtn: 'AI orqali hamroh xat yaratish',
    clContentLabel: 'Hamroh xat matni',
    clContentPh: "Yuqoridagi tugmani bosing yoki xat matnini o'zingiz yozing...",
    downloadClPdf: 'Hamroh xatni PDF yuklash',
    // Preview Sections
    secSummary: 'OʻZIM HAQIMDA',
    secExperience: 'ISH TAJRIBASI',
    secEducation: "TA'LIM",
    secSkills: "KO'NIKMALAR",
    secContact: 'ALOQA',
    // Photo Crop Modal
    cropTitle: 'Fotosuratni sozlash',
    cropZoom: 'Yaqinlashtirish',
    cropCircle: 'Doira',
    cropSquare: 'Kvadrat',
    saveBtn: 'Saqlash',
    cancelBtn: 'Bekor qilish',
    closeBtn: 'Yopish',
    aiLanguageInstruction: 'Write the response strictly in Uzbek language (Latin script).'
  },
  ru: {
    appTitle: 'AI Конструктор Резюме',
    tabResume: 'Резюме',
    tabCoverLetter: 'Сопроводительное письмо',
    previewBtn: 'Просмотр',
    downloadPdf: 'Скачать PDF',
    saved: 'Сохранено',
    saving: 'Сохранение...',
    localSaved: 'Сохранено локально',
    personalInfo: 'Личные данные',
    uploadPhoto: 'Загрузить фото',
    changePhoto: 'Изменить фото',
    fullName: 'ФИО полностью',
    fullNamePh: 'Например: Алишер Валиев',
    jobTitle: 'Желаемая должность',
    jobTitlePh: 'Например: Frontend Разработчик',
    email: 'Электронная почта',
    emailPh: 'example@mail.com',
    phone: 'Телефон',
    phonePh: '+998 90 123 45 67',
    address: 'Адрес',
    addressPh: 'г. Ташкент, Узбекистан',
    birthDate: 'Дата / год рождения',
    birthDatePh: '15.05.2002',
    summaryTitle: 'О себе (Краткое резюме)',
    summaryPh: 'Опишите ваш опыт, цели и ключевые достижения...',
    aiGenerateSummary: 'Написать с AI',
    aiImprove: 'Улучшить с AI',
    experienceTitle: 'Опыт работы',
    addExperience: '+ Добавить место работы',
    company: 'Название компании',
    companyPh: 'Компания или организация',
    position: 'Должность',
    positionPh: 'Ваша должность',
    period: 'Период работы',
    periodPh: '2023 - По настоящее время',
    description: 'Обязанности и достижения',
    descriptionPh: 'Опишите ваши задачи и достигнутые результаты...',
    aiGenerateBullets: 'Создать описание с AI',
    educationTitle: 'Образование',
    addEducation: '+ Добавить учебное заведение',
    institution: 'Учебное заведение',
    institutionPh: 'Название университета или колледжа',
    degree: 'Специальность / Степень',
    degreePh: 'Бакалавр, Программная инженерия',
    eduYear: 'Годы обучения',
    eduYearPh: '2020 - 2024',
    skillsTitle: 'Навыки и сильные стороны',
    skillPh: 'Введите навык (например: React, Английский)...',
    addSkillBtn: 'Добавить',
    aiSuggestSkills: 'AI подбор сильных сторон',
    designTitle: 'Шаблон дизайна и цвета',
    templateMinimalist: 'Минимализм',
    templateClassic: 'Классический',
    templateModern: 'Современный',
    accentColor: 'Основной цвет',
    clTitle: 'Сопроводительное письмо (Cover Letter)',
    clSubtitle: 'Персонализированное письмо для работодателя на основе вашего резюме',
    targetCompany: 'В какую компанию подаете?',
    targetCompanyPh: 'Название компании',
    targetRole: 'На какую должность?',
    targetRolePh: 'Название должности',
    jobDetails: 'Требования вакансии (необязательно)',
    jobDetailsPh: 'Вставьте описание вакансии или ключевые требования...',
    generateClBtn: 'Сгенерировать письмо с AI',
    clContentLabel: 'Текст сопроводительного письма',
    clContentPh: 'Нажмите кнопку выше или напишите текст вручную...',
    downloadClPdf: 'Скачать письмо в PDF',
    secSummary: 'О СЕБЕ',
    secExperience: 'ОПЫТ РАБОТЫ',
    secEducation: 'ОБРАЗОВАНИЕ',
    secSkills: 'НАВЫКИ',
    secContact: 'КОНТАКТЫ',
    cropTitle: 'Настройка фотографии',
    cropZoom: 'Масштаб',
    cropCircle: 'Круг',
    cropSquare: 'Квадрат',
    saveBtn: 'Сохранить',
    cancelBtn: 'Отмена',
    closeBtn: 'Закрыть',
    aiLanguageInstruction: 'Write the response strictly in Russian language.'
  },
  en: {
    appTitle: 'AI Resume Builder',
    tabResume: 'Resume',
    tabCoverLetter: 'Cover Letter',
    previewBtn: 'Preview',
    downloadPdf: 'Download PDF',
    saved: 'Saved',
    saving: 'Saving...',
    localSaved: 'Saved locally',
    personalInfo: 'Personal Information',
    uploadPhoto: 'Upload Photo',
    changePhoto: 'Change Photo',
    fullName: 'Full Name',
    fullNamePh: 'e.g. Alex Johnson',
    jobTitle: 'Target Job Title',
    jobTitlePh: 'e.g. Frontend Developer',
    email: 'Email Address',
    emailPh: 'example@mail.com',
    phone: 'Phone Number',
    phonePh: '+1 234 567 8900',
    address: 'Location / Address',
    addressPh: 'Tashkent, Uzbekistan',
    birthDate: 'Date / Year of Birth',
    birthDatePh: '15.05.2002',
    summaryTitle: 'Professional Summary',
    summaryPh: 'Briefly describe your experience, goals, and key strengths...',
    aiGenerateSummary: 'Write with AI',
    aiImprove: 'Improve with AI',
    experienceTitle: 'Work Experience',
    addExperience: '+ Add Experience',
    company: 'Company Name',
    companyPh: 'Company or organization',
    position: 'Job Title / Role',
    positionPh: 'Your role',
    period: 'Duration',
    periodPh: '2023 - Present',
    description: 'Responsibilities & Achievements',
    descriptionPh: 'Describe your key responsibilities and measurable results...',
    aiGenerateBullets: 'Generate with AI',
    educationTitle: 'Education',
    addEducation: '+ Add Education',
    institution: 'Institution',
    institutionPh: 'University or college name',
    degree: 'Degree / Field of Study',
    degreePh: 'B.Sc. in Computer Science',
    eduYear: 'Graduation Year',
    eduYearPh: '2020 - 2024',
    skillsTitle: 'Skills & Core Strengths',
    skillPh: 'Type a skill (e.g. React, Project Management)...',
    addSkillBtn: 'Add',
    aiSuggestSkills: 'AI Highlight Strengths',
    designTitle: 'Design Template & Colors',
    templateMinimalist: 'Minimalist',
    templateClassic: 'Classic',
    templateModern: 'Modern',
    accentColor: 'Accent Color',
    clTitle: 'Cover Letter Generator',
    clSubtitle: 'Tailored cover letter generated directly from your resume data',
    targetCompany: 'Target Company',
    targetCompanyPh: 'Company name',
    targetRole: 'Target Position',
    targetRolePh: 'Job title',
    jobDetails: 'Job Description / Requirements (Optional)',
    jobDetailsPh: 'Paste key job requirements here for better tailoring...',
    generateClBtn: 'Generate Cover Letter with AI',
    clContentLabel: 'Cover Letter Content',
    clContentPh: 'Click the button above or write your cover letter here...',
    downloadClPdf: 'Download Cover Letter PDF',
    secSummary: 'SUMMARY',
    secExperience: 'EXPERIENCE',
    secEducation: 'EDUCATION',
    secSkills: 'SKILLS',
    secContact: 'CONTACT',
    cropTitle: 'Adjust Photo',
    cropZoom: 'Zoom',
    cropCircle: 'Circle',
    cropSquare: 'Square',
    saveBtn: 'Save',
    cancelBtn: 'Cancel',
    closeBtn: 'Close',
    aiLanguageInstruction: 'Write the response strictly in English language.'
  }
};

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Slate', value: '#1e293b' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Blue', value: '#0284c7' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#d97706' }
];

const INITIAL_DATA = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    photo: '',
    photoShape: 'circle',
    photoZoom: 1
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  design: {
    template: 'modern',
    accentColor: '#4f46e5'
  },
  coverLetter: {
    targetCompany: '',
    targetRole: '',
    jobDetails: '',
    content: ''
  }
};

// --- GEMINI API HELPER ---
async function callGeminiAI(promptText) {
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is missing in .env');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    })
  });
  if (!response.ok) {
    throw new Error('Gemini API request failed');
  }
  const result = await response.json();
  return result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export default function App() {
  const [lang, setLang] = useState('uz');
  const t = TRANSLATIONS[lang];

  const [user, setUser] = useState(null);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ai_resume_builder_data_v2');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [saveStatus, setSaveStatus] = useState('saved');
  const [activeTab, setActiveTab] = useState('resume'); // 'resume' | 'coverLetter'
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Skill input
  const [skillInput, setSkillInput] = useState('');

  // Photo Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImage, setRawImage] = useState('');
  const [tempZoom, setTempZoom] = useState(1);
  const [tempShape, setTempShape] = useState('circle');
  const fileInputRef = useRef(null);

  // AI Loading States
  const [loadingAI, setLoadingAI] = useState({
    summary: false,
    expId: null,
    skills: false,
    coverLetter: false
  });

  // --- AUTH & FIRESTORE SYNC ---
  useEffect(() => {
    if (!auth) return;
    signInAnonymously(auth).catch((e) => console.warn('Auth warning:', e));
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'resumes', 'default');
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setData((prev) => ({ ...prev, ...snap.data() }));
        }
      },
      (err) => console.warn('Firestore read warning:', err)
    );
    return () => unsub();
  }, [user]);

  // Auto-save to localStorage + Firestore
  useEffect(() => {
    localStorage.setItem('ai_resume_builder_data_v2', JSON.stringify(data));
    if (!user || !db) {
      setSaveStatus('local');
      return;
    }
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'resumes', 'default');
        await setDoc(docRef, data, { merge: true });
        setSaveStatus('saved');
      } catch (e) {
        setSaveStatus('local');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [data, user]);

  // --- FORM HANDLERS ---
  const updatePersonal = (field, value) => {
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now().toString(), company: '', position: '', period: '', description: '' }
      ]
    }));
  };

  const updateExperience = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeExperience = (id) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id)
    }));
  };

  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now().toString(), institution: '', degree: '', year: '' }
      ]
    }));
  };

  const updateEducation = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeEducation = (id) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id)
    }));
  };

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!data.skills.includes(trimmed)) {
      setData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  // --- PHOTO UPLOAD & CROP ---
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setTempZoom(data.personal.photoZoom || 1);
      setTempShape(data.personal.photoShape || 'circle');
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const saveCroppedPhoto = () => {
    setData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        photo: rawImage,
        photoZoom: tempZoom,
        photoShape: tempShape
      }
    }));
    setCropModalOpen(false);
  };

  // --- AI ACTIONS ---
  const handleAISummary = async () => {
    setLoadingAI((p) => ({ ...p, summary: true }));
    try {
      const prompt = `You are an expert HR resume writer. ${t.aiLanguageInstruction}
Write a concise, impactful 3-4 sentence professional resume summary for a candidate.
Candidate Name: ${data.personal.fullName || 'Candidate'}
Target Role: ${data.personal.jobTitle || 'Specialist'}
Skills: ${data.skills.join(', ') || 'General professional skills'}
Experience: ${data.experience.map((e) => `${e.position} at ${e.company}`).join('; ') || 'Entry/Mid level'}
Existing draft: ${data.summary}
Return ONLY the final summary text without quotes or markdown headings.`;
      const text = await callGeminiAI(prompt);
      if (text) setData((prev) => ({ ...prev, summary: text.trim() }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAI((p) => ({ ...p, summary: false }));
    }
  };

  const handleAIExperience = async (exp) => {
    setLoadingAI((p) => ({ ...p, expId: exp.id }));
    try {
      const prompt = `You are an expert resume writer. ${t.aiLanguageInstruction}
Write 3-4 strong, action-oriented bullet points (using "• ") describing responsibilities and measurable achievements for this job role:
Position: ${exp.position || data.personal.jobTitle || 'Specialist'}
Company: ${exp.company || 'Company'}
Existing notes: ${exp.description}
Return ONLY the bullet points without extra intro or outro text.`;
      const text = await callGeminiAI(prompt);
      if (text) updateExperience(exp.id, 'description', text.trim());
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAI((p) => ({ ...p, expId: null }));
    }
  };

  const handleAISkills = async () => {
    setLoadingAI((p) => ({ ...p, skills: true }));
    try {
      const prompt = `You are a career coach. ${t.aiLanguageInstruction}
Based on the role "${data.personal.jobTitle || 'Modern Professional'}" and experience "${data.experience.map((e) => e.position).join(', ')}", suggest 6 key hard & soft strengths/skills.
Return ONLY a comma-separated list of short skill names (e.g., Leadership, React.js, Communication). No numbering or explanations.`;
      const text = await callGeminiAI(prompt);
      if (text) {
        const parsed = text
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        setData((prev) => ({
          ...prev,
          skills: Array.from(new Set([...prev.skills, ...parsed]))
        }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAI((p) => ({ ...p, skills: false }));
    }
  };

  const handleAICoverLetter = async () => {
    setLoadingAI((p) => ({ ...p, coverLetter: true }));
    try {
      const prompt = `You are an expert career advisor. ${t.aiLanguageInstruction}
Write a persuasive, professional cover letter based on this candidate's resume:
Candidate Name: ${data.personal.fullName || 'Candidate'}
Current/Target Profession: ${data.personal.jobTitle || 'Specialist'}
Summary: ${data.summary}
Skills: ${data.skills.join(', ')}
Experience: ${data.experience.map((e) => `${e.position} at ${e.company} (${e.description})`).join('; ')}
Target Company: ${data.coverLetter.targetCompany || 'Hiring Company'}
Target Role: ${data.coverLetter.targetRole || data.personal.jobTitle || 'Open Position'}
Job Description Notes: ${data.coverLetter.jobDetails}
Format it cleanly as a ready-to-send letter with greeting and sign-off. Return ONLY the letter text.`;
      const text = await callGeminiAI(prompt);
      if (text) {
        setData((prev) => ({
          ...prev,
          coverLetter: { ...prev.coverLetter, content: text.trim() }
        }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAI((p) => ({ ...p, coverLetter: false }));
    }
  };

  // --- INSTANT PDF EXPORT ---
  const handleDownloadPDF = () => {
    setShowPreviewModal(true);
    setTimeout(() => {
      window.print();
    }, 350);
  };

  // --- RESUME DOCUMENT RENDERER (3 TEMPLATES) ---
  const renderResumeSheet = () => {
    const { personal, summary, experience, education, skills, design } = data;
    const accent = design.accentColor;
    const tpl = design.template;

    const PhotoElement = personal.photo ? (
      <div
        className={`overflow-hidden border-2 shrink-0 ${
          personal.photoShape === 'circle' ? 'rounded-full' : 'rounded-xl'
        }`}
        style={{
          width: tpl === 'modern' ? '96px' : '84px',
          height: tpl === 'modern' ? '96px' : '84px',
          borderColor: tpl === 'modern' ? 'rgba(255,255,255,0.4)' : accent
        }}
      >
        <img
          src={personal.photo}
          alt={personal.fullName}
          className="w-full h-full object-cover"
          style={{ transform: `scale(${personal.photoZoom || 1})` }}
        />
      </div>
    ) : null;

    // 1. ZAMONAVIY (TWO-COLUMN SIDEBAR)
    if (tpl === 'modern') {
      return (
        <div className="w-full min-h-[297mm] bg-white text-slate-800 grid grid-cols-12 shadow-sm">
          {/* Left Sidebar */}
          <div
            className="col-span-4 p-7 text-white flex flex-col gap-6"
            style={{ backgroundColor: accent }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              {PhotoElement}
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-snug">
                  {personal.fullName || t.fullNamePh.replace('Masalan: ', '').replace('Например: ', '').replace('e.g. ', '')}
                </h1>
                {personal.jobTitle && (
                  <p className="text-xs uppercase tracking-widest opacity-90 mt-1 font-medium">
                    {personal.jobTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            {(personal.phone || personal.email || personal.address || personal.birthDate) && (
              <div className="space-y-2.5 text-xs border-t border-white/20 pt-5">
                <h3 className="font-bold uppercase tracking-wider text-white/80 text-[11px]">
                  {t.secContact}
                </h3>
                {personal.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{personal.phone}</span>
                  </div>
                )}
                {personal.email && (
                  <div className="flex items-center gap-2 break-all">
                    <Mail className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{personal.email}</span>
                  </div>
                )}
                {personal.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{personal.address}</span>
                  </div>
                )}
                {personal.birthDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{personal.birthDate}</span>
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="space-y-2.5 border-t border-white/20 pt-5">
                <h3 className="font-bold uppercase tracking-wider text-white/80 text-[11px]">
                  {t.secSkills}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded text-xs bg-white/15 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Body */}
          <div className="col-span-8 p-8 space-y-6">
            {summary && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-widest pb-1.5 mb-2.5 border-b-2"
                  style={{ color: accent, borderColor: accent }}
                >
                  {t.secSummary}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {summary}
                </p>
              </section>
            )}

            {experience.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-widest pb-1.5 mb-3 border-b-2"
                  style={{ color: accent, borderColor: accent }}
                >
                  {t.secExperience}
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{exp.position}</h3>
                        <span className="text-xs font-medium text-slate-500 shrink-0">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: accent }}>
                        {exp.company}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-widest pb-1.5 mb-3 border-b-2"
                  style={{ color: accent, borderColor: accent }}
                >
                  {t.secEducation}
                </h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{edu.institution}</h3>
                        <p className="text-xs text-slate-600">{edu.degree}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-500 shrink-0">
                        {edu.year}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      );
    }

    // 2. KLASSIK (CENTERED TRADITIONAL)
    if (tpl === 'classic') {
      return (
        <div className="w-full min-h-[297mm] bg-white text-slate-900 p-10 space-y-6 font-serif">
          <header
            className="border-b-2 pb-5 flex items-center justify-between gap-6"
            style={{ borderColor: accent }}
          >
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
                {personal.fullName}
              </h1>
              {personal.jobTitle && (
                <p className="text-sm font-sans font-semibold text-slate-600 uppercase tracking-wider">
                  {personal.jobTitle}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-sans text-slate-600 pt-1">
                {personal.phone && <span>{personal.phone}</span>}
                {personal.email && <span>• {personal.email}</span>}
                {personal.address && <span>• {personal.address}</span>}
                {personal.birthDate && <span>• {personal.birthDate}</span>}
              </div>
            </div>
            {PhotoElement}
          </header>

          {summary && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-widest mb-2"
                style={{ color: accent }}
              >
                {t.secSummary}
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {summary}
              </p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-widest mb-3 border-b pb-1"
                style={{ color: accent, borderColor: '#e2e8f0' }}
              >
                {t.secExperience}
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-sm">
                        {exp.position} — <span className="font-normal italic">{exp.company}</span>
                      </h3>
                      <span className="text-xs font-sans text-slate-500">{exp.period}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-700 mt-1.5 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-widest mb-3 border-b pb-1"
                style={{ color: accent, borderColor: '#e2e8f0' }}
              >
                {t.secEducation}
              </h2>
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-sm">{edu.institution}</span>
                      {edu.degree && <span className="text-xs text-slate-600"> — {edu.degree}</span>}
                    </div>
                    <span className="text-xs font-sans text-slate-500">{edu.year}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-widest mb-2 border-b pb-1"
                style={{ color: accent, borderColor: '#e2e8f0' }}
              >
                {t.secSkills}
              </h2>
              <p className="text-xs font-sans text-slate-700 leading-relaxed">
                {skills.join('  •  ')}
              </p>
            </section>
          )}
        </div>
      );
    }

    // 3. MINIMALIST (CLEAN ULTRA-LIGHT)
    return (
      <div className="w-full min-h-[297mm] bg-white text-slate-800 p-10 space-y-7">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-slate-900">
              {personal.fullName}
            </h1>
            {personal.jobTitle && (
              <p className="text-sm font-medium mt-1" style={{ color: accent }}>
                {personal.jobTitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-3">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.address && <span>{personal.address}</span>}
              {personal.birthDate && <span>{personal.birthDate}</span>}
            </div>
          </div>
          {PhotoElement}
        </header>

        {summary && (
          <section className="grid grid-cols-12 gap-4 pt-4 border-t border-slate-100">
            <div className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.secSummary}
            </div>
            <div className="col-span-9 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {summary}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section className="grid grid-cols-12 gap-4 pt-4 border-t border-slate-100">
            <div className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.secExperience}
            </div>
            <div className="col-span-9 space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-sm text-slate-900">{exp.position}</h3>
                    <span className="text-xs text-slate-400">{exp.period}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{exp.company}</p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="grid grid-cols-12 gap-4 pt-4 border-t border-slate-100">
            <div className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.secEducation}
            </div>
            <div className="col-span-9 space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{edu.institution}</h3>
                    <p className="text-xs text-slate-500">{edu.degree}</p>
                  </div>
                  <span className="text-xs text-slate-400">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="grid grid-cols-12 gap-4 pt-4 border-t border-slate-100">
            <div className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.secSkills}
            </div>
            <div className="col-span-9 flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  // --- COVER LETTER DOCUMENT RENDERER ---
  const renderCoverLetterSheet = () => {
    const { personal, coverLetter, design } = data;
    return (
      <div className="w-full min-h-[297mm] bg-white text-slate-800 p-12 flex flex-col justify-between">
        <div className="space-y-8">
          <header
            className="border-b-2 pb-5 flex justify-between items-end"
            style={{ borderColor: design.accentColor }}
          >
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{personal.fullName}</h1>
              <p className="text-sm font-medium mt-0.5" style={{ color: design.accentColor }}>
                {personal.jobTitle}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              {personal.email && <p>{personal.email}</p>}
              {personal.phone && <p>{personal.phone}</p>}
              {personal.address && <p>{personal.address}</p>}
            </div>
          </header>

          <div className="text-sm leading-7 text-slate-700 whitespace-pre-line">
            {coverLetter.content || t.clContentPh}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      {/* Print Styling */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-sheet, #printable-sheet * { visibility: visible; }
          #printable-sheet {
            position: fixed;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">{t.appTitle}</h1>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {saveStatus === 'saving'
                    ? t.saving
                    : saveStatus === 'saved'
                    ? t.saved
                    : t.localSaved}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Language Switcher + Preview + PDF Download */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Top-Right Language Switcher (O'Z | RU | EN) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              {[
                { code: 'uz', label: "O'Z" },
                { code: 'ru', label: 'RU' },
                { code: 'en', label: 'EN' }
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                    lang === item.code
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>{t.previewBtn}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t.downloadPdf}</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* MODE SWITCHER TABS (RESUME vs COVER LETTER) */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="inline-flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'resume'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t.tabResume}
          </button>
          <button
            onClick={() => setActiveTab('coverLetter')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'coverLetter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            {t.tabCoverLetter}
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {activeTab === 'resume' ? (
          <>
            {/* 1. PERSONAL INFORMATION */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-base">{t.personalInfo}</h2>
              </div>

              {/* Photo Upload Row */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden transition group"
                >
                  {data.personal.photo ? (
                    <img
                      src={data.personal.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${data.personal.photoZoom || 1})` }}
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    {data.personal.photo ? t.changePhoto : t.uploadPhoto}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    value={data.personal.fullName}
                    onChange={(e) => updatePersonal('fullName', e.target.value)}
                    placeholder={t.fullNamePh}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.jobTitle}
                  </label>
                  <input
                    type="text"
                    value={data.personal.jobTitle}
                    onChange={(e) => updatePersonal('jobTitle', e.target.value)}
                    placeholder={t.jobTitlePh}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.phone}
                  </label>
                  <input
                    type="text"
                    value={data.personal.phone}
                    onChange={(e) => updatePersonal('phone', e.target.value)}
                    placeholder={t.phonePh}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={data.personal.email}
                    onChange={(e) => updatePersonal('email', e.target.value)}
                    placeholder={t.emailPh}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.address}
                  </label>
                  <input
                    type="text"
                    value={data.personal.address}
                    onChange={(e) => updatePersonal('address', e.target.value)}
                    placeholder={t.addressPh}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.birthDate}
                  </label>
                  <input
                    type="text"
                    value={data.personal.birthDate}
                    onChange={(e) => updatePersonal('birthDate', e.target.value)}
                    placeholder={t.birthDatePh}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  />
                </div>
              </div>
            </section>

            {/* 2. SUMMARY + AI */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h2 className="font-bold text-slate-900 text-base">{t.summaryTitle}</h2>
                <button
                  type="button"
                  onClick={handleAISummary}
                  disabled={loadingAI.summary}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition disabled:opacity-50"
                >
                  {loadingAI.summary ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{data.summary ? t.aiImprove : t.aiGenerateSummary}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={data.summary}
                onChange={(e) => setData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder={t.summaryPh}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm leading-relaxed"
              />
            </section>

            {/* 3. WORK EXPERIENCE */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-slate-900 text-base">{t.experienceTitle}</h2>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addExperience}</span>
                </button>
              </div>

              <div className="space-y-4">
                {data.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-3.5 right-3.5 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          {t.company}
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder={t.companyPh}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          {t.position}
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          placeholder={t.positionPh}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          {t.period}
                        </label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                          placeholder={t.periodPh}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-500">
                          {t.description}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAIExperience(exp)}
                          disabled={loadingAI.expId === exp.id}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition"
                        >
                          {loadingAI.expId === exp.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>{t.aiGenerateBullets}</span>
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder={t.descriptionPh}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. EDUCATION */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-slate-900 text-base">{t.educationTitle}</h2>
                </div>
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addEducation}</span>
                </button>
              </div>

              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 relative pr-10"
                  >
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-4 right-3.5 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        {t.institution}
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder={t.institutionPh}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        {t.degree}
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder={t.degreePh}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        {t.eduYear}
                      </label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                        placeholder={t.eduYearPh}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. SKILLS & STRENGTHS */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-slate-900 text-base">{t.skillsTitle}</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAISkills}
                  disabled={loadingAI.skills}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                >
                  {loadingAI.skills ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{t.aiSuggestSkills}</span>
                </button>
              </div>

              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder={t.skillPh}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  {t.addSkillBtn}
                </button>
              </form>

              {data.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* 6. DESIGN TEMPLATES & COLORS */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <Palette className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-base">{t.designTitle}</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'minimalist', label: t.templateMinimalist },
                  { id: 'classic', label: t.templateClassic },
                  { id: 'modern', label: t.templateModern }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        design: { ...prev.design, template: item.id }
                      }))
                    }
                    className={`p-3.5 rounded-xl border-2 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                      data.design.template === item.id
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {data.design.template === item.id && <Check className="w-4 h-4" />}
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-600">{t.accentColor}</span>
                <div className="flex items-center gap-2.5">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          design: { ...prev.design, accentColor: c.value }
                        }))
                      }
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center ${
                        data.design.accentColor === c.value
                          ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                          : ''
                      }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {data.design.accentColor === c.value && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          /* COVER LETTER SECTION */
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-lg">{t.clTitle}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.clSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t.targetCompany}
                </label>
                <input
                  type="text"
                  value={data.coverLetter.targetCompany}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      coverLetter: { ...prev.coverLetter, targetCompany: e.target.value }
                    }))
                  }
                  placeholder={t.targetCompanyPh}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t.targetRole}
                </label>
                <input
                  type="text"
                  value={data.coverLetter.targetRole}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      coverLetter: { ...prev.coverLetter, targetRole: e.target.value }
                    }))
                  }
                  placeholder={t.targetRolePh}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t.jobDetails}
              </label>
              <textarea
                rows={3}
                value={data.coverLetter.jobDetails}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    coverLetter: { ...prev.coverLetter, jobDetails: e.target.value }
                  }))
                }
                placeholder={t.jobDetailsPh}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleAICoverLetter}
              disabled={loadingAI.coverLetter}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {loadingAI.coverLetter ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{t.generateClBtn}</span>
            </button>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t.clContentLabel}
              </label>
              <textarea
                rows={10}
                value={data.coverLetter.content}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    coverLetter: { ...prev.coverLetter, content: e.target.value }
                  }))
                }
                placeholder={t.clContentPh}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm leading-relaxed outline-none focus:border-indigo-500"
              />
            </div>
          </section>
        )}
      </main>

      {/* PHOTO CROP & ZOOM MODAL */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">{t.cropTitle}</h3>

            <div className="flex justify-center py-2">
              <div
                className={`w-40 h-40 overflow-hidden border-4 border-indigo-600 bg-slate-100 ${
                  tempShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`}
              >
                <img
                  src={rawImage}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform"
                  style={{ transform: `scale(${tempZoom})` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="1"
                  max="2.2"
                  step="0.05"
                  value={tempZoom}
                  onChange={(e) => setTempZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <ZoomIn className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempShape('circle')}
                  className={`py-2 rounded-xl text-xs font-semibold border ${
                    tempShape === 'circle'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {t.cropCircle}
                </button>
                <button
                  type="button"
                  onClick={() => setTempShape('square')}
                  className={`py-2 rounded-xl text-xs font-semibold border ${
                    tempShape === 'square'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {t.cropSquare}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={saveCroppedPhoto}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                {t.saveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE A4 PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[210mm] mx-auto space-y-4">
            {/* Modal Top Bar */}
            <div className="bg-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-lg">
              <span className="font-bold text-sm text-slate-800">
                A4 — {activeTab === 'resume' ? t.tabResume : t.tabCoverLetter}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadPdf}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Sheet Container */}
            <div id="printable-sheet" className="shadow-2xl mx-auto overflow-hidden">
              {activeTab === 'resume' ? renderResumeSheet() : renderCoverLetterSheet()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}