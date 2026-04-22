import { db } from './connection.ts'
import { users, protocols, complianceLogs, hazardZones, protocolZones } from './schema.ts'
import { hashPassword } from '../utils/passwords.ts'

const seed = async () => {
  console.log('🛡️  Starting SafeSite database seed...')

  try {
    console.log('🗑️  Clearing existing data...')
    await db.delete(complianceLogs)
    await db.delete(protocolZones)
    await db.delete(protocols)
    await db.delete(hazardZones)
    await db.delete(users)

    console.log('👥 Creating demo users...')
    const hashedPassword = await hashPassword('SafetyFirst123!')
    
    const [safetyOfficer] = await db.insert(users).values({
      email: 'officer@safesite.com',
      username: 'safety_officer',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Martinez',
    }).returning()

    const [technician1] = await db.insert(users).values({
      email: 'tech1@safesite.com',
      username: 'tech_james',
      password: hashedPassword,
      firstName: 'James',
      lastName: 'Wilson',
    }).returning()

    const [technician2] = await db.insert(users).values({
      email: 'tech2@safesite.com',
      username: 'tech_maria',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Garcia',
    }).returning()

    console.log('⚠️  Creating hazard zones...')
    const [highVoltageZone] = await db.insert(hazardZones).values({
      name: 'High Voltage Area',
      color: '#dc2626', // Red - High Risk
    }).returning()

    const [chemicalZone] = await db.insert(hazardZones).values({
      name: 'Chemical Storage',
      color: '#eab308', // Yellow - Medium Risk
    }).returning()

    const [generalZone] = await db.insert(hazardZones).values({
      name: 'General Workspace',
      color: '#16a34a', // Green - Low Risk
    }).returning()

    const [confinedZone] = await db.insert(hazardZones).values({
      name: 'Confined Spaces',
      color: '#dc2626', // Red - High Risk
    }).returning()

    console.log('📋 Creating safety protocols...')
    const [ppeProtocol] = await db.insert(protocols).values({
      userId: safetyOfficer.id,
      name: 'Morning PPE Inspection',
      description: 'Verify all personal protective equipment is in good condition and properly fitted',
      frequency: 'DAILY',
      targetCount: 1,
      isActive: true,
    }).returning()

    const [lockoutProtocol] = await db.insert(protocols).values({
      userId: safetyOfficer.id,
      name: 'Lockout/Tagout Verification',
      description: 'Ensure equipment is properly isolated and tagged before maintenance',
      frequency: 'DAILY',
      targetCount: 2,
      isActive: true,
    }).returning()

    const [fireExtinguisherProtocol] = await db.insert(protocols).values({
      userId: safetyOfficer.id,
      name: 'Fire Extinguisher Check',
      description: 'Inspect fire extinguisher pressure gauge and accessibility',
      frequency: 'WEEKLY',
      targetCount: 1,
      isActive: true,
    }).returning()

    const [voltageDetectorProtocol] = await db.insert(protocols).values({
      userId: safetyOfficer.id,
      name: 'Voltage Detector Test',
      description: 'Test voltage detector functionality before use',
      frequency: 'DAILY',
      targetCount: 1,
      isActive: true,
    }).returning()

    const [chemicalLabelProtocol] = await db.insert(protocols).values({
      userId: safetyOfficer.id,
      name: 'Chemical Label Inspection',
      description: 'Verify all chemical containers are properly labeled with hazard information',
      frequency: 'DAILY',
      targetCount: 1,
      isActive: true,
    }).returning()

    console.log('🔗 Linking protocols to hazard zones...')
    await db.insert(protocolZones).values([
      { protocolId: ppeProtocol.id, zoneId: generalZone.id },
      { protocolId: lockoutProtocol.id, zoneId: highVoltageZone.id },
      { protocolId: fireExtinguisherProtocol.id, zoneId: generalZone.id },
      { protocolId: voltageDetectorProtocol.id, zoneId: highVoltageZone.id },
      { protocolId: chemicalLabelProtocol.id, zoneId: chemicalZone.id },
    ])

    console.log('✅ Adding compliance logs (last 7 days)...')
    const today = new Date()
    today.setHours(8, 0, 0, 0)

    const logsToInsert = [
      // PPE Inspections
      { protocolId: ppeProtocol.id, note: 'All PPE in good condition, no replacements needed', daysAgo: 0 },
      { protocolId: ppeProtocol.id, note: 'Hard hats inspected, one crack found - replaced immediately', daysAgo: 1 },
      { protocolId: ppeProtocol.id, note: 'Safety glasses cleaned, all equipment functional', daysAgo: 2 },
      
      // Lockout/Tagout
      { protocolId: lockoutProtocol.id, note: 'LOTO procedure completed on conveyor belt, equipment isolated', daysAgo: 0 },
      { protocolId: lockoutProtocol.id, note: 'Verified all energy sources disconnected before maintenance', daysAgo: 0 },
      { protocolId: lockoutProtocol.id, note: 'Tags properly placed, authorized personnel only', daysAgo: 1 },
      
      // Fire Extinguisher
      { protocolId: fireExtinguisherProtocol.id, note: 'Fire extinguisher pressure gauge in green zone, accessible', daysAgo: 0 },
      
      // Voltage Detector
      { protocolId: voltageDetectorProtocol.id, note: 'Voltage detector tested on known live circuit - functional', daysAgo: 0 },
      { protocolId: voltageDetectorProtocol.id, note: 'Detector calibration verified, ready for use', daysAgo: 1 },
      { protocolId: voltageDetectorProtocol.id, note: 'Battery level checked, replaced per schedule', daysAgo: 2 },
      
      // Chemical Labels
      { protocolId: chemicalLabelProtocol.id, note: 'All chemical containers properly labeled with SDS info', daysAgo: 0 },
      { protocolId: chemicalLabelProtocol.id, note: 'Found one faded label, replaced with updated GHS symbols', daysAgo: 1 },
    ]

    for (const log of logsToInsert) {
      const completionDate = new Date(today)
      completionDate.setDate(completionDate.getDate() - log.daysAgo)
      
      await db.insert(complianceLogs).values({
        protocolId: log.protocolId,
        completionDate,
        note: log.note,
      })
    }

    console.log('\n✅ SafeSite database seeded successfully!\n')
    console.log('📊 Summary:')
    console.log('   ✓ 3 demo users created')
    console.log('   ✓ 4 hazard zones created')
    console.log('   ✓ 5 safety protocols created')
    console.log('   ✓ 12 compliance logs created')
    console.log('\n👥 Demo User Credentials:')
    console.log('   Safety Officer: officer@safesite.com / SafetyFirst123!')
    console.log('   Technician 1:   tech1@safesite.com / SafetyFirst123!')
    console.log('   Technician 2:   tech2@safesite.com / SafetyFirst123!')
    console.log('\n🛡️  SafeSite is ready for compliance tracking!\n')
  } catch (e) {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
  .then(() => process.exit(0))
  .catch((e) => process.exit(1))
}

export default seed