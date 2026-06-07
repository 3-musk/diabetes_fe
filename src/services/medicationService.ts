export type MedCategory = 'Capsules' | 'Pills' | 'Liquid' | 'Others';

export const saveMedication = async (data: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return { success: true };
};
