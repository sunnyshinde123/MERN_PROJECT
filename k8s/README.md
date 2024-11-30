# KIND Cluster Setup Guide

## 1. Installing KIND and kubectl
Install KIND and kubectl using the provided script:
```bash

#!/bin/bash

[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo cp ./kind /usr/local/bin/kind

VERSION="v1.30.0"
URL="https://dl.k8s.io/release/${VERSION}/bin/linux/amd64/kubectl"
INSTALL_DIR="/usr/local/bin"

curl -LO "$URL"
chmod +x kubectl
sudo mv kubectl $INSTALL_DIR/
kubectl version --client

rm -f kubectl
rm -rf kind

echo "kind & kubectl installation complete."
```

## 2. Setting Up the KIND Cluster
Create a kind-cluster-config.yaml file:

```yaml

kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4

nodes:
- role: control-plane
  image: kindest/node:v1.31.2
- role: worker
  image: kindest/node:v1.31.2
- role: worker
  image: kindest/node:v1.31.2
```
Create the cluster using the configuration file:

```bash

kind create cluster --config kind-cluster-config.yaml --name my-kind-cluster
```
Verify the cluster:

```bash

kubectl get nodes
kubectl cluster-info
```
## 3. Accessing the Cluster
Use kubectl to interact with the cluster:
```bash

kubectl cluster-info
```


## 4. Setting Up the Kubernetes Dashboard
Deploy the Dashboard
Apply the Kubernetes Dashboard manifest:
```bash

kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```
Create an Admin User
Create a dashboard-admin-user.yml file with the following content:

```yaml

apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```
Apply the configuration:

```bash

kubectl apply -f dashboard-admin-user.yml
```
Get the Access Token
Retrieve the token for the admin-user:

```bash

kubectl -n kubernetes-dashboard create token admin-user
```
Copy the token for use in the Dashboard login.

Access the Dashboard
Start the Dashboard using kubectl proxy:

```bash

kubectl proxy
```
Open the Dashboard in your browser:

```bash

http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```
Use the token from the previous step to log in.

## 5. Deleting the Cluster
Delete the KIND cluster:
```bash

kind delete cluster --name my-kind-cluster
```

## 6. Notes

Multiple Clusters: KIND supports multiple clusters. Use unique --name for each cluster.
Custom Node Images: Specify Kubernetes versions by updating the image in the configuration file.
Ephemeral Clusters: KIND clusters are temporary and will be lost if Docker is restarted.

------------------------------------------------------------------------------------------------------------------------------------------------------
# HPA & VPA

# Kubernetes HPA & VPA Controller (Horizontal/Vertical Pod Autoscaler) on Minikube/KIND Cluster

## In this demo, we will see how to deploy HPA controller. HPA will automatically scale the number of pods based on CPU utilization whereas VPA scales by increasing or decreasing CPU and memory resources within the existing pod containers—thus scaling capacity vertically


### Pre-requisites to implement this project:

- Create 1 virtual machine on AWS with 2 CPU, 4GB of RAM (t2.medium)
- Setup minikube on it Minikube setup.
- Ensure you have the Metrics Server installed in your Minikube cluster to enable HPA. If not already installed, you can install it using:
```bash
minikube addons enable metrics-server
```
- Check minikube cluster status and nodes :
```bash
minikube status
kubectl get nodes
```
- If you are using a Kind cluster install Metrics Server
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```
- Edit the Metrics Server Deployment
```bash
kubectl -n kube-system edit deployment metrics-server
```
- Add the security bypass to deployment under `container.args`
```bash
- --kubelet-insecure-tls
- --kubelet-preferred-address-types=InternalIP,Hostname,ExternalIP
```
- Restart the deployment
```bash
kubectl -n kube-system rollout restart deployment metrics-server
```
- Verify if the metrics server is running
```bash
kubectl get pods -n kube-system
kubectl top nodes
```
- For VPA
```bash
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler
./hack/vpa-up.sh
```
- Verify the pods on VPA
```bash
kubectl get pods -n kube-system
```
#
## What we are going to implement:
In this demo, we will create an deployment & service files for Apache and with the help of HPA, we will automatically scale the number of pods based on CPU utilization.
#
### Steps to implement HPA:

- Update the Deployments:

  - We'll modify the existing Apache deployment YAML files to include resource requests and limits. This is required for HPA to monitor CPU usage.
```bash
#apache-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apache-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: apache
  template:
    metadata:
      labels:
        app: apache
    spec:
      containers:
      - name: apache
        image: httpd:2.4
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
          limits:
            cpu: 200m
---
apiVersion: v1
kind: Service
metadata:
  name: apache-service
spec:
  selector:
    app: apache
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```
#
- Apply the updated deployments:
```bash
kubectl apply -f apache-deployment.yaml
```
#
- Create HPA Resources
  - We will create HPA resources for both Apache and NGINX deployments. The HPA will scale the number of pods based on CPU utilization.
```bash
#apache-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: apache-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: apache-deployment
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 20
```
#
- Apply the HPA resources:
```bash
kubectl apply -f apache-hpa.yaml
```
#
- port forward to access the Apache service on browser.
```bash
kubectl port-forward svc/apache-service 8081:80 --address 0.0.0.0 &
```
#
- Verify HPA
  - You can check the status of the HPA using the following command:
```bash
kubectl get hpa
```
> This will show you the current state of the HPA, including the current and desired number of replicas.

#
### Stress Testing
#
- To see HPA in action, you can perform a stress test on your deployments. Here is an example of how to generate load on the Apache deployment using 'BusyBox':
```bash
kubectl run -i --tty load-generator --image=busybox /bin/sh
```
#
- Inside the container, use 'wget' to generate load:
```bash
while true; do wget -q -O- http://apache-service.default.svc.cluster.local; done
```

This will generate continuous load on the Apache service, causing the HPA to scale up the number of pods.

#
- Now to check if HPA worked or not, open a same new terminal and run the following command
```bash
kubectl get hpa -w
```

> Note: Wait for few minutes to get the status reflected.

#

---------------------------------------------------------------------------------------------------------------------------------------------------------
# Ingress
# Kubernetes Ingress Controller on Minikube Cluster

### In this demo, we will see how to use ingress controller to route the traffic on different services.

### Pre-requisites to implement this project:
-  Create 1 virtual machine on AWS with 2 CPU, 4GB of RAM (t2.medium)
- Setup minikube on it <a href="https://github.com/LondheShubham153/kubestarter/blob/main/minikube_installation.md">Minikube setup</a>.

#

### What we are going to implement:
- In this demo, we will create two deployment and services i.e nginx and apache and with the help of ingress, we will route the traffic between the services

#
## Steps to implement ingress:

<b>1) Create minikube cluster as mentioned in pre-requisites :</b>

#
<b>2) Check minikube cluster status and nodes :</b>
```bash
minikube status
kubectl get nodes
```
#
<b>3) Create one yaml file for apache deployment and service :</b>
```bash
# apache-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apache-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: apache
  template:
    metadata:
      labels:
        app: apache
    spec:
      containers:
      - name: apache
        image: httpd:2.4
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: apache-service
spec:
  selector:
    app: apache
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

#
<b>4) Apply apache deployment :</b>
```bash
kubectl apply -f apache-deployment.yaml
```

#
<b>5) Create one more yaml file for nginx deployment and service :</b>
```bash
# nginx-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP

```

#
<b>6) Apply nginx deployment :</b>
```bash
kubectl apply -f nginx-deployment.yaml
```

#
<b>7) Enable the Ingress Controller :</b>
```bash
minikube addons enable ingress
```

#
<b>8) Now create an Ingress resource that routes traffic to the Apache and NGINX services based on the URL path.</b>
```bash
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: apache-nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: "tws.com"
    http:
      paths:
      - path: /apache
        pathType: Prefix
        backend:
          service:
            name: apache-service
            port:
              number: 80
      - path: /nginx
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

#
<b>9) Apply the Ingress resource :</b>
```bash
kubectl apply -f ingress.yaml
```

#
<b>10) To test the Ingress, map the hostname to the Minikube IP in your */etc/hosts* file :</b>
```bash
echo "$(minikube ip) tws.com" | sudo tee -a /etc/hosts
```
<center>OR</center>
Open <b>/etc/hosts</b> file and add your minikube ip and domain name at the last.

#
<b>11) Now, test the routing :</b>

  - curl http://tws.com/apache to access the Apache service.
  ```bash
  curl http://tws.com/apache
  ```
  - curl http://tws.com/nginx to access the NGINX service.
  ```bash
  curl http://tws.com/nginx
  ```
<center>OR</center>


- port forward to access the Apache service on browser.
  ```bash
  kubectl port-forward svc/apache-service 8081:80 --address 0.0.0.0 &
  ```
- port forward to access the NGINX service on browser.
  ```bash
  kubectl port-forward svc/nginx-service 8082:80 --address 0.0.0.0 &
  ```

#


