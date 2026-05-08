terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}

provider "hcloud" {
  token = var.hcloud_token
}

variable "hcloud_token" {
  description = "Hetzner Cloud API Token"
  type        = string
  sensitive   = true
}

resource "hcloud_ssh_key" "admin" {
  name       = "Executive_Commander_Key"
  public_key = file("~/.ssh/id_rsa.pub")
}

# تعريف خادم Hetzner Cloud لـ Samurai Nodes
resource "hcloud_server" "samurai_node" {
  name        = "samurai-node-01"
  image       = "ubuntu-22.04"
  server_type = "cx21" # أداء متوازن لـ VLESS/Hysteria
  location    = "nbg1" # Nuremberg لتأخير استجابة منخفض
  ssh_keys    = [hcloud_ssh_key.admin.id]

  # سكريبت Bash لتنصيب Docker ومحركات التشفير فور التشغيل
  user_data = file("setup_nodes.sh")
}

output "node_ip" {
  value = hcloud_server.samurai_node.ipv4_address
}
