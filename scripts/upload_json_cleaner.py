import json

with open("openapi.json", "r") as file:
    openapi_data = json.load(file)

# Step 1: Filter paths tagged "upload"
filtered_paths = {
    path: methods
    for path, methods in openapi_data["paths"].items()
    if any("upload" in method.get("tags", []) for method in methods.values())
}

# Step 2: Collect referenced components
def get_referenced_components(data, ref_key="$ref"):
    """Recursively find all `$ref` values in a dictionary."""
    refs = set()
    if isinstance(data, dict):
        for key, value in data.items():
            if key == ref_key and isinstance(value, str):
                refs.add(value.split("/")[-1])  # Extract the last part of the $ref path
            else:
                refs.update(get_referenced_components(value, ref_key))
    elif isinstance(data, list):
        for item in data:
            refs.update(get_referenced_components(item, ref_key))
    return refs

# Get all references in the filtered paths
referenced_components = set()
for methods in filtered_paths.values():
    for method_details in methods.values():
        referenced_components.update(get_referenced_components(method_details))

# Step 3: Extract relevant components
filtered_components = {
    key: value
    for key, value in openapi_data["components"]["schemas"].items()
    if key in referenced_components
}

validation_error_schema = openapi_data["components"]["schemas"].get("ValidationError")
if validation_error_schema:
    filtered_components["ValidationError"] = validation_error_schema

# Step 4: Combine everything into a new OpenAPI structure
trimmed_openapi = {
    "openapi": openapi_data["openapi"],
    "info": openapi_data["info"],
    "paths": filtered_paths,
    "components": {
        "schemas": filtered_components
    }
}

# Output the result
with open("openapi.json", "w") as file:
    json.dump(trimmed_openapi, file, indent=2)
