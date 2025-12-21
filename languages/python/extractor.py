from core.ir import CodeComponent
def extract_components(tree, source, file_path, module_path):
    components = {}
    root = tree.root_node

    def walk(node, parent_type=None):

        # -------- TOP-LEVEL FUNCTIONS --------
        if node.type == "function_definition" and parent_type == "module":
            name = node.child_by_field_name("name").text.decode()
            cid = f"{module_path}.{name}"

            components[cid] = CodeComponent(
                id=cid,
                language="python",
                type="function",
                file_path=file_path,
                module_path=module_path,
                start_line=node.start_point[0] + 1,
                end_line=node.end_point[0] + 1,
                source_code=source[node.start_byte:node.end_byte],
            )

        # -------- CLASSES --------
        elif node.type == "class_definition":
            cname = node.child_by_field_name("name").text.decode()
            class_id = f"{module_path}.{cname}"

            components[class_id] = CodeComponent(
                id=class_id,
                language="python",
                type="class",
                file_path=file_path,
                module_path=module_path,
                start_line=node.start_point[0] + 1,
                end_line=node.end_point[0] + 1,
                source_code=source[node.start_byte:node.end_byte],
            )

            # 🔥 THIS IS THE IMPORTANT PART
            body = node.child_by_field_name("body")
            if body:
                for stmt in body.children:

                    # ---------------- NORMAL METHOD ----------------
                    if stmt.type in ("function_definition", "async_function_definition"):
                        func_node = stmt

                    # ---------------- DECORATED METHOD ----------------
                    elif stmt.type == "decorated_definition":
                        func_node = None
                        for c in stmt.children:
                            if c.type in ("function_definition", "async_function_definition"):
                                func_node = c
                                break
                        if not func_node:
                            continue

                    else:
                        continue

                    # ---------- COMMON METHOD HANDLING ----------
                    method_name = func_node.child_by_field_name("name").text.decode()
                    method_id = f"{class_id}.{method_name}"

                    components[method_id] = CodeComponent(
                        id=method_id,
                        language="python",
                        type="method",
                        file_path=file_path,
                        module_path=module_path,
                        start_line=func_node.start_point[0] + 1,
                        end_line=func_node.end_point[0] + 1,
                        source_code=source[func_node.start_byte:func_node.end_byte],
                    )

        for c in node.children:
            walk(c, node.type)

    walk(root, "module")
    return components