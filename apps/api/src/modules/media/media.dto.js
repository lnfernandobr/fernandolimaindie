export const toMediaResult = ({ slug, audioUrl, imageUrl }) => ({
  slug,
  audioUrl: audioUrl ?? null,
  imageUrl: imageUrl ?? null,
});
