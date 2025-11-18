#!/bin/sh

# Script d'initialisation de la base de données
# Attend que MySQL soit prêt et exécute les migrations Prisma

set -e

echo "🔄 Attente de la disponibilité de MySQL..."

# Fonction pour vérifier la connexion MySQL
check_mysql() {
  npx prisma db execute --stdin <<EOF
SELECT 1;
EOF
}

# Attendre que MySQL soit prêt (max 30 tentatives, 2 secondes entre chaque)
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if check_mysql > /dev/null 2>&1; then
    echo "✅ MySQL est prêt!"
    break
  fi
  
  attempt=$((attempt + 1))
  echo "⏳ Tentative $attempt/$max_attempts - MySQL n'est pas encore prêt..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Erreur: Impossible de se connecter à MySQL après $max_attempts tentatives"
  exit 1
fi

echo "🔄 Génération du client Prisma..."
npx prisma generate

echo "🔄 Application des migrations..."
npx prisma migrate deploy

echo "✅ Initialisation de la base de données terminée avec succès!"