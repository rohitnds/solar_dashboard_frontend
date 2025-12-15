// utils/transformSiteRows.js
export function transformSiteRows(siteDgrRows, unitRows) {
  return siteDgrRows.map((dgrRow) => {
    const { value, timestamp } = dgrRow;

    // Extract unit-level data (ignore aggregates)
    const units = Object.keys(value)
      .filter((key) => unitRows.some((unit) => unit.id === key))
      .map((unitId) => ({
        id: unitId,
        ...value[unitId],
      }));

    // Extract aggregate fields
    const aggregates = (({ totalGeneration, totalGenerationPerKw, cufGen, prGen, cufNetExport, tlLoss }) => 
      ({ totalGeneration, totalGenerationPerKw, cufGen, prGen, cufNetExport, tlLoss }))(value);

    return {
      timestamp,
      units,
      ...aggregates,
    };
  });
}
