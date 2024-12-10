import * as Yup from 'yup';

export const albumValidationSchema = Yup.object({
  title: Yup.string()
    .required('Le titre est requis')
    .min(1, 'Le titre est trop court')
    .max(100, 'Le titre est trop long'),
  artist: Yup.string()
    .required('L\'artiste est requis'),
  releaseDate: Yup.date()
    .required('La date de sortie est requise')
    .max(new Date(), 'La date ne peut pas être dans le futur'),
  genre: Yup.string()
    .required('Le genre est requis'),
  tracks: Yup.array()
    .of(
      Yup.object({
        title: Yup.string().required('Le titre de la piste est requis'),
        duration: Yup.string()
          .matches(/^([0-9]{2}):([0-9]{2})$/, 'Format invalide (mm:ss)')
          .required('La durée est requise'),
      })
    )
    .min(1, 'L\'album doit contenir au moins une piste'),
  cover: Yup.mixed()
    .required('La pochette est requise')
    .test('fileSize', 'L\'image est trop grande', value => 
      !value || value.size <= 5000000
    )
    .test('fileType', 'Format d\'image non supporté', value =>
      !value || ['image/jpeg', 'image/png', 'image/webp'].includes(value.type)
    ),
  metadata: Yup.object({
    label: Yup.string(),
    copyright: Yup.string(),
    credits: Yup.array().of(
      Yup.object({
        role: Yup.string().required('Le rôle est requis'),
        name: Yup.string().required('Le nom est requis'),
      })
    ),
    tags: Yup.array().of(Yup.string()),
    bpm: Yup.number().positive('Le BPM doit être positif'),
    isExplicit: Yup.boolean(),
  }),
});

export const artistValidationSchema = Yup.object({
  name: Yup.string()
    .required('Le nom est requis')
    .min(2, 'Le nom est trop court'),
  biography: Yup.string()
    .required('La biographie est requise')
    .min(50, 'La biographie est trop courte'),
  genres: Yup.array()
    .of(Yup.string())
    .min(1, 'Sélectionnez au moins un genre'),
  image: Yup.mixed()
    .required('La photo est requise')
    .test('fileSize', 'L\'image est trop grande', value => 
      !value || value.size <= 5000000
    )
    .test('fileType', 'Format d\'image non supporté', value =>
      !value || ['image/jpeg', 'image/png', 'image/webp'].includes(value.type)
    ),
  socialLinks: Yup.object({
    spotify: Yup.string().url('URL invalide'),
    instagram: Yup.string().url('URL invalide'),
    twitter: Yup.string().url('URL invalide'),
  }),
  metadata: Yup.object({
    aliases: Yup.array().of(Yup.string()),
    birthDate: Yup.date(),
    birthPlace: Yup.string(),
    labels: Yup.array().of(Yup.string()),
    awards: Yup.array().of(
      Yup.object({
        name: Yup.string().required(),
        year: Yup.number().required(),
      })
    ),
  }),
}); 