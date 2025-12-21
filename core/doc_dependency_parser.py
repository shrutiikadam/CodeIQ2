def apply_doc_dependency_rules(components):
    """
    Documentation-oriented dependency abstraction
    (aligned with the research repo output).
    """

    # ==================================================
    # PASS 1: CLEAN CLASS-LEVEL DEPENDENCIES
    # ==================================================
    for comp in components.values():
        if comp.type != "class":
            continue

        new_deps = set()

        for dep in comp.depends_on:
            # Drop self-dependency
            if dep == comp.id:
                continue

            # Keep own methods
            if dep.startswith(comp.id + "."):
                new_deps.add(dep)
                continue

            # External class method → external class
            owner = ".".join(dep.split(".")[:-1])
            if owner in components and components[owner].type == "class":
                new_deps.add(owner)
            else:
                new_deps.add(dep)

        comp.depends_on = new_deps

    # ==================================================
    # PASS 2: CLEAN METHOD / FUNCTION DEPENDENCIES
    # ==================================================
    for comp in components.values():
        if comp.type not in ("method", "function"):
            continue

        self_class = ".".join(comp.id.split(".")[:-1]) if comp.type == "method" else None
        new_deps = set()

        for dep in comp.depends_on:

            # Drop self-class dependency
            if self_class and dep == self_class:
                continue

            # Drop private intra-class helpers
            if self_class and dep.startswith(self_class + "._"):
                continue

            # Keep direct external class dependency
            if dep in components and components[dep].type == "class":
                new_deps.add(dep)
                continue

            # External class method → class
            owner = ".".join(dep.split(".")[:-1])
            if owner in components and components[owner].type == "class":
                new_deps.add(owner)
                continue

            # Keep module-level functions
            new_deps.add(dep)

        comp.depends_on = new_deps

    # ==================================================
    # PASS 3: ORCHESTRATOR METHOD COLLAPSE
    # ==================================================
    for comp in components.values():
        if comp.type != "method":
            continue

        class_id = ".".join(comp.id.split(".")[:-1])
        class_comp = components.get(class_id)

        if not class_comp:
            continue

        # If method only uses class-level collaborators → hide
        if comp.depends_on and comp.depends_on.issubset(class_comp.depends_on):
            comp.depends_on = set()
