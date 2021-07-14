const mongoose = require('mongoose');
const Tour = require('./tour');

const savedSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Saved must have a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Saved must have a user'],
  },
});

savedSchema.index({ tour: 1, user: 1 }, { unique: true });
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

savedSchema.statics.calculateTourLikes = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        totalSaves: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      saves: stats[0].totalSaves,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      saves: 0,
    });
  }
};

savedSchema.post('save', function () {
  this.constructor.calculateTourLikes(this.tour);
});

//findByIdAnd
savedSchema.pre('deleteMany', async function (next) {
  this.saveDoc = await this.findOne();
  next();
});
savedSchema.post('deleteMany', function (doc, next) {
  // console.log('in delemany middlwaree, doc is', doc);//deletinga document returns { n: 1, ok: 1, deletedCount: 1 }
  this.saveDoc.constructor.calculateTourLikes(this.saveDoc.tour);
  next();
});

const Saved = mongoose.model('Saved', savedSchema);
module.exports = Saved;
