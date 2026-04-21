export const getOrCreate = (map: Map<string, Set<string>>, key: string): Set<string> => {
  let set = map.get(key)
  if (!set) {
    set = new Set()
    map.set(key, set)
  }
  return set
}
