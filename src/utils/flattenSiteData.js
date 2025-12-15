// utils/flattenSiteData.js
export function flattenSiteData(dgrData) {
  if (!Array.isArray(dgrData)) return [];

  return dgrData.map((entry) => {
    const { timestamp, value } = entry;
    const flattened = { timestamp };

    Object.keys(value).forEach((siteId) => {
      const metrics = value[siteId];

      if (metrics && typeof metrics === "object") {
        Object.keys(metrics).forEach((metricKey) => {
          const columnKey = `${siteId}_${metricKey}`;
          flattened[columnKey] = metrics[metricKey];
        });
      }
    });

    return flattened;
  });
}
