from dataclasses import dataclass, field, asdict
from typing import Set

@dataclass
class CodeComponent:
    id: str
    language: str
    type: str
    file_path: str
    module_path: str
    start_line: int
    end_line: int
    source_code: str
    depends_on: Set[str] = field(default_factory=set)
    
    def to_dict(self):
        d = asdict(self)
        d["depends_on"] = list(self.depends_on)
        d.pop("source_code")  # optional: remove raw source
        return d
