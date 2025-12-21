def resolve_dependencies(component, tree, source, all_components):
    deps = set()

    name_index = {cid.split(".")[-1]: cid for cid in all_components}
    local_vars = set()

    class_name = None
    if component.type == "method":
        class_name = component.id.split(".")[-2]

    def walk(node):
        # ---------- ASSIGNMENTS ----------
        if node.type == "assignment":
            lhs = node.child_by_field_name("left")
            if lhs and lhs.type == "identifier":
                local_vars.add(lhs.text.decode())

        # ---------- CALLS ----------
        if node.type == "call":
            fn = node.child_by_field_name("function")
            if not fn:
                return

            text = fn.text.decode()
            parts = text.split(".")

            # self.method()
            if text.startswith("self.") and class_name:
                method = parts[-1]
                candidate = f"{component.id.rsplit('.',1)[0]}.{method}"
                if candidate in all_components:
                    deps.add(candidate)

            # DataProcessor.process()
            elif len(parts) == 2:
                owner, method = parts

                if method in name_index:
                    deps.add(name_index[method])

                if owner in name_index:
                    deps.add(name_index[owner])

            # plain function call
            elif len(parts) == 1:
                name = parts[0]
                if name not in local_vars and name in name_index:
                    deps.add(name_index[name])

        for c in node.children:
            walk(c)

    component_node = find_component_node(tree, component)
    if component_node:
        walk(component_node)

    return deps

def find_component_node(tree, component):
    root = tree.root_node

    def walk(node, parent_class=None):
        # -------- CLASS --------
        if node.type == "class_definition":
            cname = node.child_by_field_name("name").text.decode()
            if component.type == "class" and component.id.endswith(f".{cname}"):
                return node
            parent_class = cname

        # -------- FUNCTION --------
        if component.type == "function" and node.type in (
            "function_definition",
            "async_function_definition",
        ):
            name = node.child_by_field_name("name").text.decode()
            if component.id.endswith(f".{name}"):
                return node

        # -------- METHOD (incl decorators) --------
        if component.type == "method":
            if node.type == "decorated_definition":
                for c in node.children:
                    if c.type in ("function_definition", "async_function_definition"):
                        node = c
                        break

            if node.type in ("function_definition", "async_function_definition"):
                name = node.child_by_field_name("name").text.decode()
                if (
                    component.id.endswith(f".{name}")
                    and parent_class
                    and component.id.split(".")[-2] == parent_class
                ):
                    return node

        for child in node.children:
            found = walk(child, parent_class)
            if found:
                return found
        return None

    return walk(root)

