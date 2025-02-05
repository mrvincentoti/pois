#!/bin/sh

# Replace placeholders in index.html with environment variables
echo "Injecting environment variables..."

# Function to safely inject variables by stripping any surrounding quotes
inject_var() {
  var_name=$1
  var_value=$(eval echo \$$var_name) # Get the actual value of the variable
  # Remove surrounding double quotes if they exist
  var_value=$(echo "$var_value" | sed 's/^"\(.*\)"$/\1/')

  # Replace the placeholder with the stripped value
  sed -i "s|${var_name}_PLACEHOLDER|$var_value|g" /usr/share/nginx/html/index.html
}

# Replace REACT_APP_NAME placeholder
inject_var "REACT_APP_NAME"

# Replace REACT_APP_SHORT_NAME placeholder
inject_var "REACT_APP_SHORT_NAME"

# Replace REACT_APP_BASE_AUTH_URL placeholder
inject_var "REACT_APP_BASE_AUTH_URL"

# Replace REACT_APP_BASE_POI_URL placeholder
inject_var "REACT_APP_BASE_POI_URL"

# Replace REACT_APP_BASE_AUDIT_URL placeholder
inject_var "REACT_APP_BASE_AUDIT_URL"

# Replace REACT_APP_CDN placeholder
inject_var "REACT_APP_CDN"

echo "Environment variables injected successfully!"
