
species_to_diseases = {
    "apple": [
        "Apple___Scab",
        "Apple___Black_rot",
        "Apple___Cedar_apple_rust",
        "Apple___Healthy",
    ],
    "blueberry": ["Blueberry___Healthy"],
    "cherry": [
        "Cherry_(including_sour)___Powdery_mildew",
        "Cherry_(including_sour)___Healthy",
    ],
    "corn": [
        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
        "Corn_(maize)___Common_rust_",
        "Corn_(maize)___Northern_Leaf_Blight",
        "Corn_(maize)___Healthy",
    ],
    "grape": [
        "Grape___Black_rot",
        "Grape___Esca_(Black_Measles)",
        "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
        "Grape___Healthy",
    ],
    "orange": ["Orange___Haunglongbing_(Citrus_greening)"],
    "peach": ["Peach___Bacterial_spot", "Peach___Healthy"],
    "pepper": ["Pepper,_bell___Bacterial_spot", "Pepper,_bell___Healthy"],
    "potato": [
        "Potato___Early_blight",
        "Potato___Late_blight",
        "Potato___Healthy",
    ],
    "raspberry": ["Raspberry___Healthy"],
    "soybean": ["Soybean___Healthy"],
    "squash": ["Squash___Powdery_mildew"],
    "strawberry": [
        "Strawberry___Leaf_scorch",
        "Strawberry___Healthy",
    ],
    "tomato": [
        "Tomato___Bacterial_spot",
        "Tomato___Early_blight",
        "Tomato___Late_blight",
        "Tomato___Leaf_Mold",
        "Tomato___Septoria_leaf_spot",
        "Tomato___Spider_mites_Two-spotted_spider_mite",
        "Tomato___Target_Spot",
        "Tomato___Yellow_Leaf_Curl_Virus",
        "Tomato___Mosaic_virus",
        "Tomato___Healthy",
    ],
}


scientific_to_common = {
    # 1. Apple
    "malus domestica": "apple",
    
    # 2. Blueberry
    "vaccinium corymbosum": "blueberry",
    
    # 3. Cherry (including sour)
    "prunus avium": "cherry",
    "prunus cerasus": "cherry",
    
    # 4. Corn (Maize)
    "zea mays": "corn",
    
    # 5. Grape
    "vitis vinifera": "grape",
    
    # 6. Orange
    "citrus sinensis": "orange",
    "citrus reticulata": "orange",  # covers mandarins too
    
    # 7. Peach
    "prunus persica": "peach",
    
    # 8. Pepper (Bell)
    "capsicum annuum": "pepper",
    "capsicum frutescens": "pepper",
    
    # 9. Potato
    "solanum tuberosum": "potato",
    
    # 10. Raspberry
    "rubus idaeus": "raspberry",
    
    # 11. Soybean
    "glycine max": "soybean",
    
    # 12. Squash
    "cucurbita pepo": "squash",
    "cucurbita maxima": "squash",
    "cucurbita moschata": "squash",
    
    # 13. Strawberry
    "fragaria × ananassa": "strawberry",
    "fragaria ananassa": "strawberry",  # simplified name
    
    # 14. Tomato
    "solanum lycopersicum": "tomato",
}

