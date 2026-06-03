import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { InstagramChannelModel } from '../src/modules/instagram/channels.model.js';

const FIELDS_TO_UNSET = {
  imagePrompt: '',
  hashtagsPool: '',
  brandBg: '',
  brandFg: '',
  brandAccent: '',
};

const main = async () => {
  await mongoose.connect(env.MONGODB_URI);
  const collName = InstagramChannelModel.collection.collectionName;
  const before = await InstagramChannelModel.collection.countDocuments();
  console.log(`collection=${collName} docs=${before}`);

  const result = await InstagramChannelModel.collection.updateMany(
    {},
    { $unset: FIELDS_TO_UNSET },
  );
  console.log(`matched=${result.matchedCount} modified=${result.modifiedCount}`);

  const sample = await InstagramChannelModel.collection.findOne({});
  if (sample) {
    const leftovers = Object.keys(FIELDS_TO_UNSET).filter((k) => k in sample);
    console.log('sample leftovers:', leftovers.length ? leftovers : 'none');
    console.log(
      'sample keys:',
      Object.keys(sample).sort().join(', '),
    );
  }

  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
