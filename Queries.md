class HierarchyNode:
    def __init__(self, node_data):
        self.id = node_data['id']
        self.parent_id = node_data['parent_id']
        self.name_id = node_data['name_id']
        self.table_ref = node_data['table_ref']
        self.properties = {
            "planned": node_data.get("planned", 0),
            "actual": node_data.get("actual", 0),
            "fvi": node_data.get("fvi", 0),
            "in_progress": node_data.get("in_progress", 0)
        }
        self.children = []

    def add_child(self, child_node):
        self.children.append(child_node)

    def aggregate(self):
        # Bottom-top aggregation
        if self.table_ref == "line_number":
            self.properties['actual'] = self.properties['fvi'] + self.properties['in_progress']

        # Aggregate child data into parent node
        for child in self.children:
            child.aggregate()
            for key in self.properties:
                self.properties[key] += child.properties[key]

    def __repr__(self):
        return f"HierarchyNode({self.name_id}, {self.table_ref}, {self.properties})"

# Define the expected structure
expected_structure = {
    "2024": ["Sep-24", "Oct-24"],
    "2024_B": ["Sep-24", "Oct-24"]
}

# Create nodes and build hierarchy
def build_hierarchy(data, structure):
    nodes = {d['id']: HierarchyNode(d) for d in data}
    roots = []

    # Build the hierarchy by linking parent and child nodes
    for node in nodes.values():
        if node.parent_id is None:
            roots.append(node)
        else:
            parent_node = nodes.get(node.parent_id)
            if parent_node:
                parent_node.add_child(node)

    # Ensure all expected children are present for each root
    for root in roots:
        expected_children = structure.get(root.name_id, [])
        existing_children = {child.name_id for child in root.children}
        for child_name in expected_children:
            if child_name not in existing_children:
                child_node = HierarchyNode({
                    "id": None,  # Placeholder ID
                    "parent_id": root.id,
                    "name_id": child_name,
                    "table_ref": "line_name",  # Or appropriate table_ref
                    "planned": 0,
                    "actual": 0,
                    "fvi": 0,
                    "in_progress": 0
                })
                root.add_child(child_node)

    return roots

# Example data with some nodes potentially empty or missing
data = [
    {"id": 7, "parent_id": 5, "name_id": "Line_Number_1", "planned": 100, "month_year": "Sep-24", "actual": 0, "fvi": 50, "in_progress": 20, "table_ref": "line_number"},
    {"id": 8, "parent_id": 6, "name_id": "Line_Number_2", "planned": 150, "month_year": "Sep-24", "actual": 0, "fvi": 70, "in_progress": 30, "table_ref": "line_number"},
    {"id": 5, "parent_id": 3, "name_id": "Line_Name_1", "planned": 0, "month_year": "Sep-24", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "line_name"},
    {"id": 6, "parent_id": 4, "name_id": "Line_Name_2", "planned": 0, "month_year": "Sep-24", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "line_name"},
    {"id": 3, "parent_id": 2, "name_id": "BU_1", "planned": 0, "month_year": "Sep-24", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "business_unit"},
    {"id": 4, "parent_id": 2, "name_id": "BU_2", "planned": 0, "month_year": "Sep-24", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "business_unit"},
    {"id": 2, "parent_id": 1, "name_id": "Sep-24", "planned": 0, "month_year": "Sep-24", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "month"},
    {"id": 1, "parent_id": None, "name_id": "2024", "planned": 0, "month_year": "2024", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "year"},
    {"id": 10, "parent_id": 11, "name_id": "Line_Name_3", "planned": 0, "month_year": "Oct-24", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "line_name"},
    {"id": 11, "parent_id": 12, "name_id": "BU_3", "planned": 0, "month_year": "Oct-24", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "business_unit"},
    {"id": 12, "parent_id": None, "name_id": "Oct-24", "planned": 0, "month_year": "Oct-24", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "month"},
    {"id": 13, "parent_id": None, "name_id": "2024_B", "planned": 0, "month_year": "2024", "actual": 0, "fvi": 0, "in_progress": 0, "table_ref": "year"}
]

# Build the hierarchy and aggregate data
root_nodes = build_hierarchy(data, expected_structure)
for root in root_nodes:
    root.aggregate()

# Output the aggregated data for inspection
def print_nodes(node, level=0):
    print("  " * level + str(node))
    for child in node.children:
        print_nodes(child, level + 1)

for root in root_nodes:
    print_nodes(root)
