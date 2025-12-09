from mapping import species_to_diseases, scientific_to_common

def normalize_species_name(name: str):
    """Normalize predicted species name to match mapping."""
    name = name.lower().replace(".", "").replace(",", "").strip()
    for sci_name, common in scientific_to_common.items():
        if sci_name in name:
            return common
    # fallback: try partial common name match
    for common in species_to_diseases.keys():
        if common in name:
            return common
    return None

def filter_disease_predictions(species_pred, all_disease_classes, disease_probs, top_k=3):
    """Filter disease predictions based on species."""
    normalized = normalize_species_name(species_pred)
    allowed = species_to_diseases.get(normalized, [])
    results = [
        (cls, prob)
        for cls, prob in zip(all_disease_classes, disease_probs)
        if cls in allowed
    ]
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]
