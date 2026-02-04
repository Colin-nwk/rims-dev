/**
 * Helper functions for looking up names from generic data
 */

interface State {
  id: number;
  state: string;
}

interface Prison {
  id: number;
  prison_name: string;
}

/**
 * Get state name by ID
 * @param stateValue - State ID (as string or number) or state name
 * @param states - Array of states
 * @returns State name or the original value if not found, or undefined if no value provided
 */
export const getStateName = (
  stateValue?: string | number | null,
  states?: State[] | null,
): string | undefined => {
  if (!stateValue) return undefined;
  if (!states) return stateValue.toString();

  // Check if the value is numeric (ID)
  const stateValueStr = stateValue.toString();
  if (/^\d+$/.test(stateValueStr)) {
    const state = states.find((s) => s.id === Number(stateValueStr));
    return state?.state;
  }

  // Otherwise, it's already a state name
  return stateValueStr;
};

/**
 * Get prison/custodial center name by ID
 * @param prisonValue - Prison ID (as string or number) or prison name
 * @param prisons - Array of prisons
 * @returns Prison name or the original value if not found, or undefined if no value provided
 */
export const getPrisonName = (
  prisonValue?: string | number | null,
  prisons?: Prison[] | null,
): string | undefined => {
  if (!prisonValue) return undefined;
  if (!prisons) return prisonValue.toString();

  // Check if the value is numeric (ID)
  const prisonValueStr = prisonValue.toString();
  if (/^\d+$/.test(prisonValueStr)) {
    const prison = prisons.find((p) => p.id === Number(prisonValueStr));
    return prison?.prison_name;
  }

  // Otherwise, it's already a prison name
  return prisonValueStr;
};
