To get the direct children of a node in the hierarchy, you can maintain a reference to the children of each node. In the `HierarchyNode` class, we can use a list to store direct children. 

Here's how you can adjust the `HierarchyNode` class and the related code to retrieve direct children:

### Adjusted `HierarchyNode` Class

```python
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

    def get_direct_children(self):
        return self.children

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
```

### Example Usage

1. **Build the Hierarchy:**
   - Using the previously provided `build_hierarchy` function.

2. **Get Direct Children of a Node:**

```python
# Example function to find a node by name_id
def find_node_by_name(nodes, name_id):
    for node in nodes:
        if node.name_id == name_id:
            return node
    return None

# Build the hierarchy and aggregate data
root_nodes = build_hierarchy(data, mastered_data)
for root in root_nodes:
    root.aggregate()

# Example: Get direct children of a specific node
node_name = "BU_1"  # Replace with the name_id you want to query
node = find_node_by_name(root_nodes, node_name)

if node:
    children = node.get_direct_children()
    print(f"Direct children of node {node_name}:")
    for child in children:
        print(child)
else:
    print(f"Node {node_name} not found.")
```

### Explanation:

1. **Adding Children:** The `add_child` method adds child nodes to the `children` list.
   
2. **Retrieving Children:** The `get_direct_children` method returns the list of direct children.

3. **Finding a Node:** The `find_node_by_name` function locates a node based on its `name_id`.

4. **Using `get_direct_children`:** After building and aggregating the hierarchy, you can use the `get_direct_children` method to retrieve the children of a specific node.

This approach ensures that you can dynamically manage and access the direct children of any node in your hierarchy.
