import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesService } from './policies.service';
import { CreatePolizaDto } from './dto/create-poliza.dto';
import { UpdatePolizaDto } from './dto/update-poliza.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Policy } from './entities/policy.entity';
import { PolicyFilters } from './interfaces/policy.interfaces';

describe('PoliciesService', () => {
  let service: PoliciesService;

  const mockCreatePolizaDto: CreatePolizaDto = {
    rutTitular: '12345678-9',
    planSalud: 'Plan Premium',
    prima: 50000,
  };

  const mockUpdatePolizaDto: UpdatePolizaDto = {
    planSalud: 'Plan Actualizado',
    prima: 60000,
  };

  const mockPolicy: Policy = {
    id: 'test-id-123',
    rutTitular: '12345678-9',
    fechaEmision: new Date('2024-01-15'),
    planSalud: 'Plan Premium',
    prima: 50000,
    estado: 'emitida',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoliciesService],
    }).compile();

    service = module.get<PoliciesService>(PoliciesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new policy with correct data', () => {
      const result = service.create(mockCreatePolizaDto);

      expect(result).toMatchObject({
        rutTitular: mockCreatePolizaDto.rutTitular,
        planSalud: mockCreatePolizaDto.planSalud,
        prima: mockCreatePolizaDto.prima,
        estado: 'emitida',
      });
      expect(result.id).toBeDefined();
      expect(result.fechaEmision).toBeInstanceOf(Date);
      expect(typeof result.id).toBe('string');
    });

    it('should assign unique IDs to different policies', () => {
      const policy1 = service.create(mockCreatePolizaDto);
      const policy2 = service.create({
        ...mockCreatePolizaDto,
        rutTitular: '87654321-0',
      });

      expect(policy1.id).not.toBe(policy2.id);
    });

    it('should set estado to "emitida" by default', () => {
      const result = service.create(mockCreatePolizaDto);
      expect(result.estado).toBe('emitida');
    });

    it('should set fechaEmision to current date', () => {
      const beforeCreate = new Date();
      const result = service.create(mockCreatePolizaDto);
      const afterCreate = new Date();

      expect(result.fechaEmision.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(result.fechaEmision.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      const policy1 = service.create(mockCreatePolizaDto);
      const policy2 = service.create({
        ...mockCreatePolizaDto,
        rutTitular: '87654321-0',
      });
      service.updateStatus(policy2.id);
    });

    it('should return all policies when no filters provided', () => {
      const result = service.findAll();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no policies exist', () => {
      const newService = new PoliciesService();
      const result = newService.findAll();
      expect(result).toHaveLength(0);
    });

    it('should filter by estado when provided', () => {
      const filters: PolicyFilters = { estado: 'emitida' };
      const result = service.findAll(filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].estado).toBe('emitida');
    });

    it('should filter by fechaEmision when provided', () => {
      const today = new Date().toISOString().split('T')[0];
      const filters: PolicyFilters = { fechaEmision: today };
      const result = service.findAll(filters);
      
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no policies match filters', () => {
      const filters: PolicyFilters = { estado: 'anulada' };
      const result = service.findAll(filters);
      
      expect(result).toHaveLength(0);
    });

    it('should filter by both estado and fechaEmision', () => {
      const today = new Date().toISOString().split('T')[0];
      const filters: PolicyFilters = { 
        estado: 'emitida',
        fechaEmision: today
      };
      const result = service.findAll(filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].estado).toBe('emitida');
    });
  });

  describe('findOne', () => {
    let createdPolicy: Policy;

    beforeEach(() => {
      createdPolicy = service.create(mockCreatePolizaDto);
    });

    it('should return a policy when found', () => {
      const result = service.findOne(createdPolicy.id);
      expect(result).toEqual(createdPolicy);
    });

    it('should throw NotFoundException when policy not found', () => {
      const nonExistentId = 'non-existent-id';
      
      expect(() => service.findOne(nonExistentId)).toThrow(NotFoundException);
      expect(() => service.findOne(nonExistentId)).toThrow('Policy con ID non-existent-id no encontrada');
    });

    it('should throw NotFoundException for empty string ID', () => {
      expect(() => service.findOne('')).toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    let createdPolicy: Policy;

    beforeEach(() => {
      createdPolicy = service.create(mockCreatePolizaDto);
    });

    it('should update status from "emitida" to "activa"', () => {
      const result = service.updateStatus(createdPolicy.id);
      
      expect(result.estado).toBe('activa');
      expect(result.id).toBe(createdPolicy.id);
    });

    it('should update status from "activa" to "anulada"', () => {
      service.updateStatus(createdPolicy.id);
      const result = service.updateStatus(createdPolicy.id);
      
      expect(result.estado).toBe('anulada');
    });

    it('should throw BadRequestException when trying to update from "anulada"', () => {
      service.updateStatus(createdPolicy.id);
      service.updateStatus(createdPolicy.id);
      
      expect(() => service.updateStatus(createdPolicy.id)).toThrow(BadRequestException);
      expect(() => service.updateStatus(createdPolicy.id)).toThrow('No se puede cambiar el estado desde anulada');
    });

    it('should throw NotFoundException when policy not found', () => {
      const nonExistentId = 'non-existent-id';
      
      expect(() => service.updateStatus(nonExistentId)).toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    let createdPolicy: Policy;

    beforeEach(() => {
      createdPolicy = service.create(mockCreatePolizaDto);
    });

    it('should update policy with provided data', () => {
      const result = service.update(createdPolicy.id, mockUpdatePolizaDto);
      
      expect(result.planSalud).toBe(mockUpdatePolizaDto.planSalud);
      expect(result.prima).toBe(mockUpdatePolizaDto.prima);
      expect(result.id).toBe(createdPolicy.id);
      expect(result.rutTitular).toBe(createdPolicy.rutTitular);
    });

    it('should update only provided fields', () => {
      const partialUpdate = { planSalud: 'Nuevo Plan' };
      const result = service.update(createdPolicy.id, partialUpdate);
      
      expect(result.planSalud).toBe('Nuevo Plan');
      expect(result.prima).toBe(createdPolicy.prima);
      expect(result.rutTitular).toBe(createdPolicy.rutTitular);
    });

    it('should update rutTitular when provided', () => {
      const updateWithRut = { rutTitular: '87654321-0' };
      const result = service.update(createdPolicy.id, updateWithRut);
      
      expect(result.rutTitular).toBe('87654321-0');
    });

    it('should update prima when provided as 0', () => {
      const updateWithZeroPrima = { prima: 0 };
      const result = service.update(createdPolicy.id, updateWithZeroPrima);
      
      expect(result.prima).toBe(0);
    });

    it('should not update prima when undefined', () => {
      const updateWithoutPrima = { planSalud: 'Nuevo Plan' };
      const result = service.update(createdPolicy.id, updateWithoutPrima);
      
      expect(result.prima).toBe(createdPolicy.prima);
    });

    it('should throw NotFoundException when policy not found', () => {
      const nonExistentId = 'non-existent-id';
      
      expect(() => service.update(nonExistentId, mockUpdatePolizaDto)).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    let createdPolicy: Policy;

    beforeEach(() => {
      createdPolicy = service.create(mockCreatePolizaDto);
    });

    it('should remove policy successfully', () => {
      expect(() => service.remove(createdPolicy.id)).not.toThrow();
      
      expect(() => service.findOne(createdPolicy.id)).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when policy not found', () => {
      const nonExistentId = 'non-existent-id';
      
      expect(() => service.remove(nonExistentId)).toThrow(NotFoundException);
      expect(() => service.remove(nonExistentId)).toThrow('Policy con ID non-existent-id no encontrada');
    });

    it('should not affect other policies when removing one', () => {
      const secondPolicy = service.create({
        ...mockCreatePolizaDto,
        rutTitular: '87654321-0',
      });
      
      service.remove(createdPolicy.id);
      
      const remainingPolicies = service.findAll();
      expect(remainingPolicies).toHaveLength(1);
      expect(remainingPolicies[0].id).toBe(secondPolicy.id);
    });
  });

  describe('integration tests', () => {
    it('should handle complete CRUD operations flow', () => {
      const createdPolicy = service.create(mockCreatePolizaDto);
      expect(createdPolicy.estado).toBe('emitida');

      const allPolicies = service.findAll();
      expect(allPolicies).toHaveLength(1);

      const foundPolicy = service.findOne(createdPolicy.id);
      expect(foundPolicy).toEqual(createdPolicy);

      const updatedPolicy = service.update(createdPolicy.id, mockUpdatePolizaDto);
      expect(updatedPolicy.planSalud).toBe(mockUpdatePolizaDto.planSalud);

      const activatedPolicy = service.updateStatus(createdPolicy.id);
      expect(activatedPolicy.estado).toBe('activa');

      service.remove(createdPolicy.id);
      expect(() => service.findOne(createdPolicy.id)).toThrow(NotFoundException);
    });

    it('should maintain data integrity across operations', () => {
      const policy1 = service.create(mockCreatePolizaDto);
      const policy2 = service.create({
        ...mockCreatePolizaDto,
        rutTitular: '87654321-0',
      });

      expect(policy1.id).not.toBe(policy2.id);
      expect(policy1.rutTitular).not.toBe(policy2.rutTitular);

      const allPolicies = service.findAll();
      expect(allPolicies).toHaveLength(2);

      service.remove(policy1.id);
      const remainingPolicies = service.findAll();
      expect(remainingPolicies).toHaveLength(1);
      expect(remainingPolicies[0].id).toBe(policy2.id);
    });
  });
});
