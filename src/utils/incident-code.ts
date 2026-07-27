/**
 * Sinh ngẫu nhiên Mã sự cố theo format SC + YYMMDD + 3 số ngẫu nhiên
 */
export function generateRandomIncidentCodeParts(targetDate: Date = new Date()): {
  sosuco: string;
  masuco: number;
} {
  const yearSuffix = targetDate.getFullYear().toString().slice(-2);
  const monthPadded = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dayPadded = String(targetDate.getDate()).padStart(2, "0");
  const formattedDatePrefix = `${yearSuffix}${monthPadded}${dayPadded}`;

  const randomSequenceSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const sosuco = `SC${formattedDatePrefix}${randomSequenceSuffix}`;
  const masuco = parseInt(`${formattedDatePrefix}${randomSequenceSuffix}`, 10);

  return { sosuco, masuco };
}
