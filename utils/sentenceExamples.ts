import { Category } from '@/utils/wordData';

/**
 * One rolled-words scenario and the sentences built from it. Lives here rather
 * than inside the modal because two places show it now — the modal, and the
 * preview on the hint shown when someone sends the words back unchanged. The
 * same example in both, from one copy, so they cannot drift apart.
 */
export const EXAMPLE_ROLLED_WORDS: { category: Category; word: string }[] = [
  { category: 'VERB', word: 'Minema' },
  { category: 'PLACE', word: 'Park' },
  { category: 'NOUN', word: 'Sõber' },
];

// Three real sentences from those same three words, which is the point: the
// words are raw material, not a sentence waiting to be submitted.
export const EXAMPLE_SENTENCES: { et: string; en: string; es: string; ru: string }[] = [
  {
    et: 'Ma lähen oma sõbra parki.',
    en: "I'm going to my friend's park.",
    es: 'Voy al parque de mi amigo.',
    ru: 'Я иду в парк моего друга.',
  },
  {
    et: 'Ma ei saa minna, olen sõbraga pargis.',
    en: "I can't go, I am at the park with a friend.",
    es: 'No puedo ir, estoy en el parque con un amigo.',
    ru: 'Я не могу пойти, я в парке с другом.',
  },
  {
    et: 'Park on nii ilus. Lähme, sõber!',
    en: "Park is so beautiful. Let's go, friend!",
    es: '¡El parque es tan lindo! ¡Vamos, amigo!',
    ru: 'Парк такой красивый. Пойдём, друг!',
  },
];
