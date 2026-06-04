import { Schema, model } from 'mongoose';
import { INSTAGRAM_DEFAULTS, INSTAGRAM_LIMITS } from '../../constants/instagram.js';

const CHANNEL_COLLECTION = 'InstagramChannel';

const channelSchema = new Schema(
  {
    handle: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: INSTAGRAM_LIMITS.HANDLE_MAX,
    },
    displayName: { type: String, required: true, trim: true, maxlength: INSTAGRAM_LIMITS.NAME_MAX },
    niche: { type: String, default: '', trim: true, maxlength: INSTAGRAM_LIMITS.NAME_MAX },
    brief: { type: String, default: '', trim: true, maxlength: INSTAGRAM_LIMITS.BRIEF_MAX },
    tone: { type: String, default: INSTAGRAM_DEFAULTS.TONE, trim: true, maxlength: INSTAGRAM_LIMITS.BRIEF_MAX },
    captionStyle: {
      type: String,
      default: INSTAGRAM_DEFAULTS.CAPTION_STYLE,
      trim: true,
      maxlength: INSTAGRAM_LIMITS.CAPTION_STYLE_MAX,
    },
    slidesPerCarousel: {
      type: Number,
      default: INSTAGRAM_DEFAULTS.SLIDES_PER_CAROUSEL,
      min: INSTAGRAM_LIMITS.SLIDES_MIN,
      max: INSTAGRAM_LIMITS.SLIDES_MAX,
    },
    active: { type: Boolean, default: true },
    autoVideo: { type: Boolean, default: false },
  },
  { timestamps: true, strict: true },
);

export const InstagramChannelModel = model(CHANNEL_COLLECTION, channelSchema);
