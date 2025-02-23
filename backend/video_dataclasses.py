from dataclasses import dataclass
from typing import Dict

@dataclass
class VisualStyle:
    color_palette: str
    lighting_approach: str
    character_features: Dict
    background_elements: Dict
