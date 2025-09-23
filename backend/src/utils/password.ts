export function generatePassword(): string {
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vowels = 'aeiou';
  function syllable() {
    const c = consonants[Math.floor(Math.random()*consonants.length)];
    const v = vowels[Math.floor(Math.random()*vowels.length)];
    const c2 = Math.random() > 0.6 ? consonants[Math.floor(Math.random()*consonants.length)] : '';
    return c + v + c2;
  }
  const s1 = syllable();
  const s2 = syllable();
  const digits = ('0' + Math.floor(Math.random()*100)).slice(-2);
  let pwd = `${s1}-${s2}-${digits}`;
  pwd = pwd.charAt(0).toUpperCase() + pwd.slice(1);
  const extra = Math.floor(Math.random()*9)+1;
  pwd = pwd + extra.toString();
  return pwd;
}
