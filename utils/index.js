export const nameProcessing = (name) => {
    return name.replaceAll('/', '-').replaceAll(':', '：');
}