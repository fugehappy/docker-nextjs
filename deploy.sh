echo -e "\n\n\n================================================================="
echo -e `date +"[%Y-%m-%d %H:%M:%S]"` "build docker ..."
# Build prod using new BuildKit engine
docker-compose -f docker-compose.yml build 2>&1

echo -e "\n\n\n================================================================="
echo -e `date +"[%Y-%m-%d %H:%M:%S]"` "build docker up"
# Start prod in detached mode
docker-compose -f docker-compose.yml up -d 2>&1
echo "end ..."