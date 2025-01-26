import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "nav": {
            "admin": "Administration",
            "metrics": "Metrics",
            "artists": "Artists",
            "albums": "Albums",
            "main": "Main navigation"
          },
          "theme": {
            "light": "Light mode",
            "dark": "Dark mode"
          },
          "language": {
            "select": "Change language",
            "fr": "French",
            "en": "English",
            "ar": "Arabic"
          },
          "offline": {
            "message": "You are offline"
          },
          "dashboard": {
            "title": "System Metrics",
            "loading": "Loading system metrics...",
            "refresh": "Auto-refresh every 5 seconds",
            "configuration": "Configuration",
            "metrics": {
              "apiResponseTime": "API Response Time",
              "cpuUsage": "CPU",
              "memoryUsage": "Memory",
              "redisLatency": "Redis Latency",
              "bandwidth": "Bandwidth",
              "requestsPerSecond": "Requests/sec"
            },
            "alertThreshold": "Alert threshold",
            "noThreshold": "No threshold"
          },
          "artists": {
            "title": "Artists Management",
            "add": "Add Artist",
            "search": "Search artists...",
            "table": {
              "name": "Name",
              "genre": "Genre",
              "followers": "Followers",
              "actions": "Actions"
            },
            "form": {
              "title": {
                "add": "Add New Artist",
                "edit": "Edit Artist"
              },
              "name": "Artist Name",
              "genre": "Genre",
              "biography": "Biography",
              "image": "Profile Image",
              "submit": "Save",
              "cancel": "Cancel",
              "validation": {
                "nameRequired": "Name is required",
                "nameMin": "Name must be at least 2 characters",
                "biographyRequired": "Biography is required",
                "biographyMin": "Biography must be at least 10 characters",
                "genreRequired": "Genre is required",
                "genreMin": "Genre must be at least 2 characters"
              }
            },
            "confirmDelete": "Are you sure you want to delete this artist?"
          },
          "albums": {
            "title": "Albums Management",
            "add": "Add Album",
            "search": "Search albums...",
            "table": {
              "title": "Title",
              "artist": "Artist",
              "year": "Release Year",
              "tracks": "Tracks",
              "actions": "Actions"
            },
            "form": {
              "title": {
                "add": "Add New Album",
                "edit": "Edit Album"
              },
              "name": "Album Title",
              "artist": "Select Artist",
              "year": "Release Year",
              "tracks": "Number of Tracks",
              "cover": "Album Cover",
              "submit": "Save",
              "cancel": "Cancel",
              "addTrack": "Add Track",
              "trackTitle": "Track Title",
              "trackDuration": "Duration",
              "selectGenre": "Select a genre",
              "genre": "Genre",
              "validation": {
                "titleRequired": "Title is required",
                "artistRequired": "Artist is required",
                "dateRequired": "Release date is required",
                "genreRequired": "Genre is required",
                "yearRequired": "Release year is required",
                "yearInvalid": "Please enter a valid year"
              }
            },
            "confirmDelete": "Are you sure you want to delete this album?"
          },
          "common": {
            "save": "Save",
            "cancel": "Cancel"
          },
          "search": {
            "recentSearches": "Recent searches",
            "noResults": "No results",
            "placeholder": "Search..."
          },
          "filters": {
            "toggle": "Filters",
            "artist": "Artist",
            "genre": "Genre",
            "yearRange": "Release Year",
            "from": "From",
            "to": "To",
            "duration": "Duration",
            "popularity": "Popularity",
            "playlist": "Playlist",
            "reset": "Reset Filters",
            "allArtists": "All Artists",
            "allGenres": "All Genres",
            "allPlaylists": "All Playlists",
            "minutes": "minutes",
            "apply": "Apply Filters",
            "name": "Name",
            "namePlaceholder": "Search by name...",
            "country": "Country",
            "allCountries": "All Countries",
            "albumCount": "Minimum Albums",
            "yearActive": "Year Active",
            "yearActivePlaceholder": "Enter year..."
          }
        }
      },
      fr: {
        translation: {
          "nav": {
            "admin": "Administration",
            "metrics": "Métriques",
            "artists": "Artistes",
            "albums": "Albums",
            "main": "Navigation principale"
          },
          "theme": {
            "light": "Mode clair",
            "dark": "Mode sombre"
          },
          "language": {
            "select": "Changer de langue",
            "fr": "Français",
            "en": "Anglais",
            "ar": "Arabeee"
          },
          "offline": {
            "message": "Vous êtes hors ligne"
          },
          "dashboard": {
            "title": "Métriques Système",
            "loading": "Chargement des métriques système...",
            "refresh": "Actualisation automatique toutes les 5 secondes",
            "configuration": "Configuration",
            "metrics": {
              "apiResponseTime": "Temps de réponse API",
              "cpuUsage": "CPU",
              "memoryUsage": "Mémoire",
              "redisLatency": "Latence Redis",
              "bandwidth": "Bande passante",
              "requestsPerSecond": "Requêtes/sec"
            },
            "alertThreshold": "Seuil d'alerte",
            "noThreshold": "Pas de seuil"
          },
          "artists": {
            "title": "Gestion des Artistes",
            "add": "Ajouter un Artiste",
            "search": "Rechercher des artistes...",
            "table": {
              "name": "Nom",
              "genre": "Genre",
              "followers": "Abonnés",
              "actions": "Actions"
            },
            "form": {
              "title": {
                "add": "Ajouter un Nouvel Artiste",
                "edit": "Modifier l'Artiste"
              },
              "name": "Nom de l'Artiste",
              "genre": "Genre",
              "biography": "Biographie",
              "image": "Photo de Profil",
              "submit": "Enregistrer",
              "cancel": "Annuler",
              "validation": {
                "nameRequired": "Le nom est requis",
                "nameMin": "Le nom doit contenir au moins 2 caractères",
                "biographyRequired": "La biographie est requise",
                "biographyMin": "La biographie doit contenir au moins 10 caractères",
                "genreRequired": "Le genre est requis",
                "genreMin": "Le genre doit contenir au moins 2 caractères"
              }
            },
            "confirmDelete": "Êtes-vous sûr de vouloir supprimer cet artiste ?"
          },
          "albums": {
            "title": "Gestion des Albums",
            "add": "Ajouter un Album",
            "search": "Rechercher des albums...",
            "table": {
              "title": "Titre",
              "artist": "Artiste",
              "year": "Année de Sortie",
              "tracks": "Pistes",
              "actions": "Actions"
            },
            "form": {
              "title": {
                "add": "Ajouter un Nouvel Album",
                "edit": "Modifier l'Album"
              },
              "name": "Titre de l'Album",
              "artist": "Sélectionner l'Artiste",
              "year": "Année de Sortie",
              "tracks": "Nombre de Pistes",
              "cover": "Pochette d'Album",
              "submit": "Enregistrer",
              "cancel": "Annuler",
              "addTrack": "Ajouter une piste",
              "trackTitle": "Titre de la piste",
              "trackDuration": "Durée",
              "selectGenre": "Sélectionner un genre",
              "genre": "Genre",
              "validation": {
                "titleRequired": "Le titre est requis",
                "artistRequired": "L'artiste est requis",
                "dateRequired": "La date de sortie est requise",
                "genreRequired": "Le genre est requis",
                "yearRequired": "L'année de sortie est requise",
                "yearInvalid": "Veuillez entrer une année valide"
              }
            },
            "confirmDelete": "Êtes-vous sûr de vouloir supprimer cet album ?"
          },
          "common": {
            "save": "Enregistrer",
            "cancel": "Annuler"
          },
          "search": {
            "recentSearches": "Recherches récentes",
            "noResults": "Aucun résultat",
            "placeholder": "Rechercher..."
          },
          "filters": {
            "toggle": "Filtres",
            "artist": "Artiste",
            "genre": "Genre",
            "yearRange": "Année de sortie",
            "from": "De",
            "to": "À",
            "duration": "Durée",
            "popularity": "Popularité",
            "playlist": "Playlist",
            "reset": "Réinitialiser les filtres",
            "allArtists": "Tous les artistes",
            "allGenres": "Tous les genres",
            "allPlaylists": "Toutes les playlists",
            "minutes": "minutes",
            "apply": "Appliquer les filtres",
            "name": "Nom",
            "namePlaceholder": "Rechercher par nom...",
            "country": "Pays",
            "allCountries": "Tous les pays",
            "albumCount": "Nombre d'albums minimum",
            "yearActive": "Année d'activité",
            "yearActivePlaceholder": "Entrer l'année..."
          }
        }
      },
      ar: {
        translation: {
          "nav": {
            "admin": "الإدارة",
            "metrics": "المقاييس",
            "artists": "الفنانون",
            "albums": "الألبومات",
            "main": "التنقل الرئيسي"
          },
          "theme": {
            "light": "الوضع الفاتح",
            "dark": "الوضع الداكن"
          },
          "language": {
            "select": "تغيير اللغة",
            "fr": "French",
            "en": "English",
            "ar": "Arabic"
          },
          "offline": {
            "message": "أنت غير متصل"
          },
          "dashboard": {
            "title": "مقاييس النظام",
            "loading": "جاري تحميل مقاييس النظام...",
            "refresh": "تحديث تلقائي كل 5 ثوان",
            "configuration": "الإعدادات",
            "metrics": {
              "apiResponseTime": "وقت استجابة API",
              "cpuUsage": "المعالج",
              "memoryUsage": "الذاكرة",
              "redisLatency": "زمن استجابة Redis",
              "bandwidth": "عرض النطاق",
              "requestsPerSecond": "الطلبات/ثانية"
            },
            "alertThreshold": "عتبة التنبيه",
            "noThreshold": "لا عتبة"
          },
          "artists": {
            "title": "إدارة الفنانين",
            "add": "إضافة فنان",
            "search": "البحث عن الفنانين...",
            "table": {
              "name": "الاسم",
              "genre": "النوع",
              "followers": "المتابعون",
              "actions": "الإجراءات"
            },
            "form": {
              "title": {
                "add": "إضافة فنان جديد",
                "edit": "تعديل الفنان"
              },
              "name": "اسم الفنان",
              "genre": "النوع",
              "biography": "السيرة الذاتية",
              "image": "الصورة الشخصية",
              "submit": "حفظ",
              "cancel": "إلغاء",
              "validation": {
                "nameRequired": "الاسم مطلوب",
                "nameMin": "يجب أن يحتوي الاسم على حرفين على الأقل",
                "biographyRequired": "السيرة الذاتية مطلوبة",
                "biographyMin": "يجب أن تحتوي السيرة الذاتية على 10 أحرف على الأقل",
                "genreRequired": "النوع مطلوب",
                "genreMin": "يجب أن يحتوي النوع على حرفين على الأقل"
              }
            },
            "confirmDelete": "هل أنت متأكد من حذف هذا الفنان؟"
          },
          "albums": {
            "title": "إدارة الألبومات",
            "add": "إضافة ألبوم",
            "search": "البحث عن الألبومات...",
            "table": {
              "title": "العنوان",
              "artist": "الفنان",
              "year": "سنة الإصدار",
              "tracks": "المقطوعات",
              "actions": "الإجراءات"
            },
            "form": {
              "title": {
                "add": "إضافة ألبوم جديد",
                "edit": "تعديل الألبوم"
              },
              "name": "عنوان الألبوم",
              "artist": "اختيار الفنان",
              "year": "سنة الإصدار",
              "tracks": "عدد المقطوعات",
              "cover": "غلاف الألبوم",
              "submit": "حفظ",
              "cancel": "إلغاء",
              "addTrack": "إضافة مقطع",
              "trackTitle": "عنوان المقطع",
              "trackDuration": "المدة",
              "selectGenre": "اختر النوع",
              "genre": "النوع",
              "validation": {
                "titleRequired": "العنوان مطلوب",
                "artistRequired": "الفنان مطلوب",
                "dateRequired": "تاريخ الإصدار مطلوب",
                "genreRequired": "النوع مطلوب",
                "yearRequired": "سنة الإصدار مطلوبة",
                "yearInvalid": "الرجاء إدخال سنة صحيحة"
              }
            },
            "confirmDelete": "هل أنت متأكد من حذف هذا الألبوم؟"
          },
          "common": {
            "save": "حفظ",
            "cancel": "إلغاء"
          },
          "search": {
            "recentSearches": "عمليات البحث الأخيرة",
            "noResults": "لا نتائج",
            "placeholder": "بحث..."
          },
          "filters": {
            "toggle": "الفلاتر",
            "artist": "الفنان",
            "genre": "النوع",
            "yearRange": "سنة الإصدار",
            "from": "من",
            "to": "إلى",
            "duration": "المدة",
            "popularity": "الشعبية",
            "playlist": "قائمة التشغيل",
            "reset": "إعادة تعيين الفلاتر",
            "allArtists": "جميع الفنانين",
            "allGenres": "جميع الأنواع",
            "allPlaylists": "جميع قوائم التشغيل",
            "minutes": "دقائق",
            "apply": "تطبيق الفلاتر",
            "name": "الاسم",
            "namePlaceholder": "البحث بالاسم...",
            "country": "البلد",
            "allCountries": "كل البلدان",
            "albumCount": "الحد الأدنى للألبومات",
            "yearActive": "سنة النشاط",
            "yearActivePlaceholder": "أدخل السنة..."
          }
        }
      }
    },
    lng: "fr", // langue par défaut
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 