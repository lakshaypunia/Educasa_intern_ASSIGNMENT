import { Request, Response, NextFunction } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { getDistanceKm } from '../utils/distance';
import {
  School,
  SchoolWithDistance,
  AddSchoolInput,
  ListSchoolsInput,
} from '../types/school.types';

export const addSchool = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, address, latitude, longitude } = req.body as AddSchoolInput;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );

    res.status(201).json({
      success: true,
      message: 'School added successfully',
      data: {
        id: result.insertId,
        name,
        address,
        latitude,
        longitude,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listSchools = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { latitude, longitude } = res.locals.validatedQuery as ListSchoolsInput;

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM schools');
    const schools = rows as School[];

    const sorted: SchoolWithDistance[] = schools
      .map((school) => ({
        ...school,
        distance_km: getDistanceKm(latitude, longitude, school.latitude, school.longitude),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    res.status(200).json({
      success: true,
      data: sorted,
    });
  } catch (err) {
    next(err);
  }
};
