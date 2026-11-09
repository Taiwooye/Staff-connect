export const launchLocations = {
  Lagos: ["Ajah", "Ikeja", "Lekki", "Surulere", "Yaba"],
  Oyo: ["Ibadan", "Ogbomoso", "Oyo", "Iseyin", "Saki"],
} as const;

export type LaunchState = keyof typeof launchLocations;

export const launchStates = Object.keys(launchLocations) as LaunchState[];

export function getAreasForState(state: string): readonly string[] {
  if (Object.prototype.hasOwnProperty.call(launchLocations, state)) {
    return launchLocations[state as LaunchState];
  }

  return [];
}
