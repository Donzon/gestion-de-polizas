import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { CreatePolizaDto } from './dto/create-poliza.dto';
import { UpdatePolizaDto } from './dto/update-poliza.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Policy } from './entities/policy.entity';

describe('PoliciesController', () => {
  let controller: PoliciesController;

  const mockPolicy: Policy = {
    id: 'test-id-123',
    rutTitular: '12345678-9',
    fechaEmision: new Date('2024-01-15'),
    planSalud: 'Plan Premium',
    prima: 50000,
    estado: 'emitida',
  };

  const mockCreatePolizaDto: CreatePolizaDto = {
    rutTitular: '12345678-9',
    planSalud: 'Plan Premium',
    prima: 50000,
  };

  const mockUpdatePolizaDto: UpdatePolizaDto = {
    planSalud: 'Plan Actualizado',
    prima: 60000,
  };

  const mockPoliciesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoliciesController],
      providers: [
        {
          provide: PoliciesService,
          useValue: mockPoliciesService,
        },
      ],
    }).compile();

    controller = module.get<PoliciesController>(PoliciesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new policy', () => {
      mockPoliciesService.create.mockReturnValue(mockPolicy);

      const result = controller.create(mockCreatePolizaDto);

      expect(mockPoliciesService.create).toHaveBeenCalledWith(
        mockCreatePolizaDto,
      );
      expect(result).toEqual(mockPolicy);
    });

    it('should handle service errors during creation', () => {
      const error = new Error('Service error');
      mockPoliciesService.create.mockImplementation(function () {
        throw error;
      });

      expect(() => controller.create(mockCreatePolizaDto)).toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all policies when no filters provided', () => {
      const policies = [mockPolicy];
      mockPoliciesService.findAll.mockReturnValue(policies);

      const result = controller.findAll({});

      expect(mockPoliciesService.findAll).toHaveBeenCalledWith({
        estado: undefined,
        fechaEmision: undefined,
      });
      expect(result).toEqual(policies);
    });

    it('should return filtered policies when filters provided', () => {
      const policies = [mockPolicy];
      const query = { estado: 'emitida', fechaEmision: '2024-01-15' };
      mockPoliciesService.findAll.mockReturnValue(policies);

      const result = controller.findAll(query);

      expect(mockPoliciesService.findAll).toHaveBeenCalledWith({
        estado: 'emitida',
        fechaEmision: '2024-01-15',
      });
      expect(result).toEqual(policies);
    });

    it('should handle service errors during findAll', () => {
      const error = new Error('Service error');
      mockPoliciesService.findAll.mockImplementation(function () {
        throw error;
      });

      expect(() => controller.findAll({})).toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return a policy by id', () => {
      mockPoliciesService.findOne.mockReturnValue(mockPolicy);

      const result = controller.findOne('test-id-123');

      expect(mockPoliciesService.findOne).toHaveBeenCalledWith('test-id-123');
      expect(result).toEqual(mockPolicy);
    });

    it('should throw NotFoundException when policy not found', () => {
      const notFoundError = new NotFoundException(
        'Policy con ID test-id-123 no encontrada',
      );
      mockPoliciesService.findOne.mockImplementation(function () {
        throw notFoundError;
      });

      expect(() => controller.findOne('test-id-123')).toThrow(
        NotFoundException,
      );
    });

    it('should handle service errors during findOne', () => {
      const error = new Error('Service error');
      mockPoliciesService.findOne.mockImplementation(function () {
        throw error;
      });

      expect(() => controller.findOne('test-id-123')).toThrow(error);
    });
  });

  describe('updateStatus', () => {
    it('should update policy status successfully', () => {
      const updatedPolicy = { ...mockPolicy, estado: 'activa' as const };
      mockPoliciesService.updateStatus.mockReturnValue(updatedPolicy);

      const result = controller.updateStatus('test-id-123');

      expect(mockPoliciesService.updateStatus).toHaveBeenCalledWith(
        'test-id-123',
      );
      expect(result).toEqual(updatedPolicy);
    });

    it('should throw NotFoundException when policy not found', () => {
      const notFoundError = new NotFoundException(
        'Policy con ID test-id-123 no encontrada',
      );
      mockPoliciesService.updateStatus.mockImplementation(function () {
        throw notFoundError;
      });

      expect(() => controller.updateStatus('test-id-123')).toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when status transition is invalid', () => {
      const badRequestError = new BadRequestException(
        'No se puede cambiar el estado desde anulada',
      );
      mockPoliciesService.updateStatus.mockImplementation(function () {
        throw badRequestError;
      });

      expect(() => controller.updateStatus('test-id-123')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a policy successfully', () => {
      const updatedPolicy = { ...mockPolicy, ...mockUpdatePolizaDto };
      mockPoliciesService.update.mockReturnValue(updatedPolicy);

      const result = controller.update('test-id-123', mockUpdatePolizaDto);

      expect(mockPoliciesService.update).toHaveBeenCalledWith(
        'test-id-123',
        mockUpdatePolizaDto,
      );
      expect(result).toEqual(updatedPolicy);
    });

    it('should throw NotFoundException when policy not found', () => {
      const notFoundError = new NotFoundException(
        'Policy con ID test-id-123 no encontrada',
      );
      mockPoliciesService.update.mockImplementation(function () {
        throw notFoundError;
      });

      expect(() =>
        controller.update('test-id-123', mockUpdatePolizaDto),
      ).toThrow(NotFoundException);
    });

    it('should handle partial updates', () => {
      const partialUpdate = { planSalud: 'Nuevo Plan' };
      const updatedPolicy = { ...mockPolicy, planSalud: 'Nuevo Plan' };
      mockPoliciesService.update.mockReturnValue(updatedPolicy);

      const result = controller.update('test-id-123', partialUpdate);

      expect(mockPoliciesService.update).toHaveBeenCalledWith(
        'test-id-123',
        partialUpdate,
      );
      expect(result).toEqual(updatedPolicy);
    });
  });

  describe('remove', () => {
    it('should remove a policy successfully', () => {
      mockPoliciesService.remove.mockReturnValue(undefined);

      const result = controller.remove('test-id-123');

      expect(mockPoliciesService.remove).toHaveBeenCalledWith('test-id-123');
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when policy not found', () => {
      const notFoundError = new NotFoundException(
        'Policy con ID test-id-123 no encontrada',
      );
      mockPoliciesService.remove.mockImplementation(function () {
        throw notFoundError;
      });

      expect(() => controller.remove('test-id-123')).toThrow(NotFoundException);
    });

    it('should handle service errors during remove', () => {
      const error = new Error('Service error');
      mockPoliciesService.remove.mockImplementation(function () {
        throw error;
      });

      expect(() => controller.remove('test-id-123')).toThrow(error);
    });
  });

  describe('integration tests', () => {
    it('should handle complete CRUD operations flow', () => {
      mockPoliciesService.create.mockReturnValue(mockPolicy);
      mockPoliciesService.findAll.mockReturnValue([mockPolicy]);
      mockPoliciesService.findOne.mockReturnValue(mockPolicy);
      mockPoliciesService.update.mockReturnValue({
        ...mockPolicy,
        ...mockUpdatePolizaDto,
      });
      mockPoliciesService.remove.mockReturnValue(undefined);

      const createResult = controller.create(mockCreatePolizaDto);
      expect(createResult).toBeDefined();

      const findAllResult = controller.findAll({});
      expect(findAllResult).toHaveLength(1);

      const findOneResult = controller.findOne(mockPolicy.id);
      expect(findOneResult).toEqual(mockPolicy);

      const updateResult = controller.update(
        mockPolicy.id,
        mockUpdatePolizaDto,
      );
      expect(updateResult).toBeDefined();

      const removeResult = controller.remove(mockPolicy.id);
      expect(removeResult).toBeUndefined();
    });
  });
});
