import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class SamuraiArmor extends StatelessWidget {
  final String armorType;
  final double size;
  final Color? color;

  const SamuraiArmor({
    super.key,
    required this.armorType,
    this.size = 50,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final String assetPath = _getArmorAsset(armorType);
    return SvgPicture.asset(
      assetPath,
      width: size,
      height: size,
      colorFilter: color != null
          ? ColorFilter.mode(color!, BlendMode.srcIn)
          : null,
    );
  }

  String _getArmorAsset(String type) {
    switch (type) {
      case 'legendary':
        return 'assets/icons/armor_legendary.svg';
      case 'epic':
        return 'assets/icons/armor_epic.svg';
      case 'rare':
        return 'assets/icons/armor_rare.svg';
      case 'lightning':
        return 'assets/icons/armor_lightning.svg';
      default:
        return 'assets/icons/armor_common.svg';
    }
  }
}
