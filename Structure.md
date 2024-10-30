def process_data(data, dataname_order, business_unit_order):
    # Create a mapping from business unit ID to name based on the order provided
    business_unit_map = {i + 1: f"business_unit{i + 1}" for i in range(len(business_unit_order))}
    
    # Initialize the final structure with ordered datanames and placeholders for y-values
    result = []
    for name in dataname_order:
        # Prepare the x-axis with ordered business unit names
        x = [business_unit_map[unit_id] for unit_id in business_unit_order]
        y = [0] * len(business_unit_order)  # Placeholder for y-values, initially set to 0
        
        # Fill in y-values based on matching data entries
        for entry in data:
            if entry["dataname"] == name:
                unit_index = business_unit_order.index(entry["business_unit_id"])
                y[unit_index] = entry["value"]
        
        # Append the processed entry to the result list
        result.append({
            "name": name.capitalize(),  # Capitalize the dataname for display purposes
            "x": x,
            "y": y
        })
    
    return result

# Sample data
data = [
    {"dataname": "actual", "business_unit_id": 1, "value": 55},
    {"dataname": "plan", "business_unit_id": 1, "value": 10}
]

# Define the order for datanames and business units
dataname_order = ["plan", "actual"]
business_unit_order = [2, 1]

# Process the data
processed_data = process_data(data, dataname_order, business_unit_order)

# Output the result
print(processed_data)
