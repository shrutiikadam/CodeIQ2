from core.repository_parser import RepositoryParser
from core.topo import (
    build_graph_from_components,
    topological_sort,
    dependency_first_dfs,
    resolve_cycles
)
from core.ir_export import export_ir
from core.dag_export import export_dag

def main():
    parser = RepositoryParser("./test_repo")  # 🔥 NO adapter

    components = parser.parse()

    export_ir(components)

    graph = build_graph_from_components(components)
    graph = resolve_cycles(graph)

    export_dag(graph)

    print("\nComponents:")
    for c in components:
        print(" ", c)

    print("\nDAG:")
    for k, v in graph.items():
        if v:
            print(f"{k} -> {list(v)}")

    print("\nDependency-first DFS order:")
    for node in dependency_first_dfs(graph):
        print(node)

    print("\nTopological Order:")
    for node in topological_sort(graph):
        print(node)

if __name__ == "__main__":
    main()
