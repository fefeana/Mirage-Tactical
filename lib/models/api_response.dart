// ===================================================================
// 📦 نماذج البيانات لتطابق واجهة FastAPI
// ===================================================================

class SystemStatus {
  final String system;
  final String phase;
  final List<String> agents;
  final Map<String, bool> enterpriseFeatures;
  final Map<String, bool> citizenFeatures;
  final String status;

  SystemStatus({
    required this.system,
    required this.phase,
    required this.agents,
    required this.enterpriseFeatures,
    required this.citizenFeatures,
    required this.status,
  });

  factory SystemStatus.fromJson(Map<String, dynamic> json) {
    return SystemStatus(
      system: json['system'] ?? 'Mirage-Tactical',
      phase: json['phase'] ?? 'citizen',
      agents: List<String>.from(json['agents'] ?? []),
      enterpriseFeatures: Map<String, bool>.from(json['enterprise_features'] ?? {}),
      citizenFeatures: Map<String, bool>.from(json['citizen_features'] ?? {}),
      status: json['status'] ?? 'UNKNOWN',
    );
  }
}

class AgentExecutionRequest {
  final String request;
  final String? agent;

  AgentExecutionRequest({required this.request, this.agent});

  Map<String, dynamic> toJson() => {
    'request': request,
    'agent': agent,
  };
}

class AgentExecutionResponse {
  final String? threatLevel;
  final List<String>? recommendations;
  final bool? requiresHuman;
  final String? agent;
  final String? llmUsed;
  final String? response;
  final List<String>? tips;
  final bool? escalate;
  final String? plan;
  final dynamic action;
  final String status;

  AgentExecutionResponse({
    this.threatLevel,
    this.recommendations,
    this.requiresHuman,
    this.agent,
    this.llmUsed,
    this.response,
    this.tips,
    this.escalate,
    this.plan,
    this.action,
    required this.status,
  });

  factory AgentExecutionResponse.fromJson(Map<String, dynamic> json) {
    return AgentExecutionResponse(
      threatLevel: json['threat_level'],
      recommendations: json['recommendations'] != null
          ? List<String>.from(json['recommendations'])
          : null,
      requiresHuman: json['requires_human'],
      agent: json['agent'],
      llmUsed: json['llm_used'],
      response: json['response'],
      tips: json['tips'] != null ? List<String>.from(json['tips']) : null,
      escalate: json['escalate'],
      plan: json['plan'],
      action: json['action'],
      status: json['status'] ?? 'UNKNOWN',
    );
  }
}

class EnterpriseRegisterRequest {
  final String name;
  final String sector;
  final String isolatedIp;

  EnterpriseRegisterRequest({
    required this.name,
    required this.sector,
    required this.isolatedIp,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'sector': sector,
    'isolated_ip': isolatedIp,
  };
}

class TOTPResponse {
  final String token;
  final int expiresIn;

  TOTPResponse({required this.token, required this.expiresIn});

  factory TOTPResponse.fromJson(Map<String, dynamic> json) {
    return TOTPResponse(
      token: json['token'] ?? '',
      expiresIn: json['expires_in'] ?? 30,
    );
  }
}
