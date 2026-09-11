import {
  AcceptInvitationRes,
  CreateEmailInvitationReq,
  CreateEmailInvitationRes,
  CreateInviteLinkRes,
  GetAllInvitationsReq,
  GetAllInvitationsRes,
  GetInvitationInfoRes,
  RevokeInvitationRes,
} from "@repo/contract";
import { Request, Response } from "express";
import { PaginationReqExtended } from "api/middleware/pagination";
import { invitationsService } from "../services/invitationsService";

export const invitationsController = {
  createEmailInvitation: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const { email } = res.locals.body as CreateEmailInvitationReq;
    const resDto: CreateEmailInvitationRes = await invitationsService.createEmailInvitation(
      authUserId,
      publicId,
      email
    );
    res.status(201).json(resDto);
  },

  createLinkInvitation: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const resDto: CreateInviteLinkRes = await invitationsService.createLinkInvitation(
      authUserId,
      publicId
    );
    res.status(201).json(resDto);
  },

  getAllInvitations: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const dto: GetAllInvitationsReq<PaginationReqExtended> = {
      ...res.locals.pagination,
      query: res.locals.query.query,
    };
    const resDto: GetAllInvitationsRes = await invitationsService.getAllInvitations(
      authUserId,
      publicId,
      dto
    );
    res.status(200).json(resDto);
  },

  revokeInvitation: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { id } = res.locals.params as { id: string };
    const resDto: RevokeInvitationRes = await invitationsService.revokeInvitation(authUserId, id);
    res.status(200).json(resDto);
  },

  getInvitationInfo: async (_req: Request, res: Response): Promise<void> => {
    const { token } = res.locals.params as { token: string };
    const resDto: GetInvitationInfoRes = await invitationsService.getInvitationInfo(token);
    res.status(200).json(resDto);
  },

  acceptInvitation: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { token } = res.locals.params as { token: string };
    const resDto: AcceptInvitationRes = await invitationsService.acceptInvitation(
      authUserId,
      token
    );
    res.status(200).json(resDto);
  },
};
