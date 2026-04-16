/**
 * A simple profanity filter utility.
 */

const BAD_WORDS = [
  'abuse', 'ass', 'asshole', 'bitch', 'bastard', 'crap', 'cunt', 'dick', 'fuck', 'fucker', 
  'goddamn', 'hell', 'piss', 'shit', 'slut', 'whore'
  // Add more as needed, or use a library in a real production environment
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export function filterProfanity(text: string, placeholder: string = '***'): string {
  if (!text) return text;
  let filteredText = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filteredText = filteredText.replace(regex, placeholder);
  });
  return filteredText;
}
