#!/bin/bash

# Setup script for local subdomain testing
# Run with: sudo bash setup-local-domains.sh

echo "Setting up local domains for clearcontract.local..."

# Hosts entries
HOSTS_ENTRIES="
# ClearContract Local Development
127.0.0.1    clearcontract.local
127.0.0.1    en.clearcontract.local
127.0.0.1    de.clearcontract.local
127.0.0.1    ru.clearcontract.local
127.0.0.1    fr.clearcontract.local
127.0.0.1    es.clearcontract.local
127.0.0.1    it.clearcontract.local
127.0.0.1    pl.clearcontract.local
127.0.0.1    api.clearcontract.local
# End ClearContract Local Development
"

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    HOSTS_FILE="/etc/hosts"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    HOSTS_FILE="/etc/hosts"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    HOSTS_FILE="/c/Windows/System32/drivers/etc/hosts"
else
    echo "Unknown OS: $OSTYPE"
    exit 1
fi

# Check if running with sudo (except on Windows)
if [[ "$OSTYPE" != "msys" ]] && [[ "$OSTYPE" != "cygwin" ]] && [[ "$OSTYPE" != "win32" ]]; then
    if [ "$EUID" -ne 0 ]; then 
        echo "Please run with sudo: sudo bash setup-local-domains.sh"
        exit 1
    fi
fi

# Check if entries already exist
if grep -q "clearcontract.local" "$HOSTS_FILE"; then
    echo "ClearContract entries already exist in $HOSTS_FILE"
    echo "To update, first remove existing entries manually."
    exit 0
fi

# Backup hosts file
cp "$HOSTS_FILE" "$HOSTS_FILE.backup.$(date +%Y%m%d%H%M%S)"
echo "Backup created: $HOSTS_FILE.backup.$(date +%Y%m%d%H%M%S)"

# Add entries
echo "$HOSTS_ENTRIES" >> "$HOSTS_FILE"
echo "✅ Local domains configured successfully!"

# Flush DNS cache based on OS
echo "Flushing DNS cache..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v systemd-resolve &> /dev/null; then
        systemd-resolve --flush-caches
    elif command -v service &> /dev/null; then
        service nscd restart 2>/dev/null || true
        service dnsmasq restart 2>/dev/null || true
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sudo dscacheutil -flushcache
    sudo killall -HUP mDNSResponder 2>/dev/null || true
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    ipconfig /flushdns
fi

echo "✅ DNS cache flushed!"
echo ""
echo "You can now access the application at:"
echo "  - http://clearcontract.local:3098 (English, default)"
echo "  - http://de.clearcontract.local:3098 (German)"
echo "  - http://ru.clearcontract.local:3098 (Russian)"
echo "  - http://fr.clearcontract.local:3098 (French)"
echo "  - http://es.clearcontract.local:3098 (Spanish)"
echo "  - http://it.clearcontract.local:3098 (Italian)"
echo "  - http://pl.clearcontract.local:3098 (Polish)"
echo ""
echo "Start the development server with: npm run dev"