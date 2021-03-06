/*
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.google.gwt.sample.mobilewebapp.server.domain;

import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.util.DAOBase;

/**
 * Factory for creating EntityManager.
 */
public final class EMF extends DAOBase {

  private static EMF singleton;

  static {
    ObjectifyService.register(Task.class);
  }

  public static EMF get() {
    if (singleton == null) {
      singleton = new EMF();
    }
    return singleton;
  }

  protected EMF() {
  }
}
