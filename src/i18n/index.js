import { useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'

const translations = {
  en: {
    brand: 'Marketplace',
    searchPlaceholder: 'Search products...',
    cart: 'Cart',
    favorites: 'Favorites',
    orders: 'Orders',
    sell: 'Sell',
    myStore: 'My Store',
    admin: 'Admin',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    hotDeals: 'Hot Deals',
    limitedOffers: `Limited time offers - Don't miss out!`,
    viewAll: 'View All',
    quickView: 'Quick View',
    addToCart: 'Add to Cart',
    specialOfferTitle: 'Special Offer for Members',
    specialOfferDesc: 'Get 30% off on your first order - Sign up now!',
    signUpSave: 'Sign Up & Save 30%',
    features: {
      fastDelivery: 'Fast Delivery',
      fastDeliveryDesc: 'Same day delivery available',
      originalProducts: 'Original Products',
      originalProductsDesc: '100% authentic guarantee',
      securePayment: 'Secure Payment',
      securePaymentDesc: 'Safe transactions',
      easyReturns: 'Easy Returns',
      easyReturnsDesc: '30-day return policy'
    }
  },
  uz: {
    brand: 'Bozor',
    searchPlaceholder: 'Mahsulotlarni qidirish...',
    cart: 'Savatcha',
    favorites: 'Sevimlilar',
    orders: 'Buyurtmalar',
    sell: 'Sotish',
    myStore: 'Mening Do‘konim',
    admin: 'Admin',
    profile: 'Profil',
    login: 'Kirish',
    register: 'Ro‘yxatdan o‘tish',
    logout: 'Chiqish',
    hotDeals: 'Issiq Takliflar',
    limitedOffers: `Cheklangan vaqt - qo'ldan boy bermang!`,
    viewAll: 'Hammasini ko‘rish',
    quickView: 'Tez ko‘rinish',
    addToCart: 'Savatchaga qo‘shish',
    specialOfferTitle: 'Aʼzolar uchun Maxsus Taklif',
    specialOfferDesc: 'Birinchi buyurtmangizga 30% chegirma - hoziroq ro‘yxatdan o‘ting!',
    signUpSave: `Ro'yxatdan o'ting va 30% tejang`,
    features: {
      fastDelivery: 'Tez Yetkazib berish',
      fastDeliveryDesc: 'Xuddi shu kuni yetkazib berish mavjud',
      originalProducts: 'Asl Mahsulotlar',
      originalProductsDesc: '100% haqiqiylik kafolati',
      securePayment: 'Xavfsiz To‘lov',
      securePaymentDesc: 'Xavfsiz tranzaksiyalar',
      easyReturns: 'Oson Qaytarish',
      easyReturnsDesc: '30 kunlik qaytarish siyosati'
    }
  },
  ru: {
    brand: 'Маркетплейс',
    searchPlaceholder: 'Поиск товаров...',
    cart: 'Корзина',
    favorites: 'Избранное',
    orders: 'Заказы',
    sell: 'Продать',
    myStore: 'Мой магазин',
    admin: 'Админ',
    profile: 'Профиль',
    login: 'Войти',
    register: 'Регистрация',
    logout: 'Выйти',
    hotDeals: 'Горячие предложения',
    limitedOffers: 'Ограниченное предложение - не пропустите!',
    viewAll: 'Посмотреть все',
    quickView: 'Быстрый просмотр',
    addToCart: 'Добавить в корзину',
    specialOfferTitle: 'Специальное предложение для участников',
    specialOfferDesc: 'Получите 30% скидку на первый заказ - зарегистрируйтесь сейчас!',
    signUpSave: 'Зарегистрируйтесь и получите 30% скидки',
    features: {
      fastDelivery: 'Быстрая доставка',
      fastDeliveryDesc: 'Доставка в тот же день доступна',
      originalProducts: 'Оригинальные товары',
      originalProductsDesc: '100% гарантия подлинности',
      securePayment: 'Безопасная оплата',
      securePaymentDesc: 'Безопасные транзакции',
      easyReturns: 'Легкий возврат',
      easyReturnsDesc: 'Политика возврата 30 дней'
    }
  }
}

export function useTranslation() {
  const { lang } = useLanguage()
  const t = useMemo(() => (key) => {
    // support nested keys like 'features.fastDelivery'
    if (!key) return ''
    const parts = key.split('.')
    let val = translations[lang] || translations.en
    for (const p of parts) {
      if (val && Object.prototype.hasOwnProperty.call(val, p)) val = val[p]
      else { val = null; break }
    }
    if (val != null) return val
    // fallback to top-level
    return translations[lang] && translations[lang][key] ? translations[lang][key] : translations.en[key] || key
  }, [lang])

  return { t, lang }
}

export default translations
