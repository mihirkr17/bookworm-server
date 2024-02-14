function calculateAverageRatings(rating = {}) {

   const totalCount = Object.values(rating).reduce((total, count) => (total + count), 0);
   const totalWeight = Object.keys(rating).reduce((sum, key) => sum + parseInt(key) * parseInt(rating[key]), 0);

   return {
      averageRatings: parseFloat((totalWeight / totalCount).toFixed(1)),
      totalRatingsCount: totalCount
   };
}
module.exports = { calculateAverageRatings }