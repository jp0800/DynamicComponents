def process_data(data, dataname_order, business_unit_order):
    # Preprocess data into a dictionary for quick lookup
    data_lookup = {(entry["dataname"], entry["business_unit_id"]): entry["value"] for entry in data}
    
    # Generate the results using list comprehensions
    result = [
        {
            "name": name.capitalize(),
            "x": [f"business_unit{unit_id}" for unit_id in business_unit_order],
            "y": [data_lookup.get((name, unit_id), 0) for unit_id in business_unit_order]
        }
        for name in dataname_order
    ]
    
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
